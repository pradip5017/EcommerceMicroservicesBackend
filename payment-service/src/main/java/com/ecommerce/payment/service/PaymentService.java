package com.ecommerce.payment.service;

import com.ecommerce.common.event.*;
import com.ecommerce.payment.dto.DummyPaymentRequest;
import com.ecommerce.payment.dto.DummyPaymentResponse;
import com.ecommerce.payment.dto.PaymentRequest;
import com.ecommerce.payment.entity.Payment;
import com.ecommerce.payment.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    private final PaymentRepository repo;
    private final KafkaTemplate<String, Object> kafka;
    private final boolean forceFailure;

    public PaymentService(PaymentRepository repo,
                          KafkaTemplate<String, Object> kafka,
                          @Value("${payment.demo.force-failure:false}") boolean forceFailure) {
        this.repo = repo;
        this.kafka = kafka;
        this.forceFailure = forceFailure;
    }

    public Payment create(PaymentRequest request) {
        Payment payment = new Payment();
        payment.setOrderId(request.orderId());
        payment.setAmount(request.amount());
        payment.setStatus(request.status());
        payment.setCreatedAt(LocalDateTime.now());
        Payment saved = repo.save(payment);

        // Notify Order Service and Notification Service via Kafka
        kafka.send("payment-completed", String.valueOf(saved.getOrderId()),
                new PaymentCompletedEvent(saved.getOrderId(), saved.getAmount(), saved.getStatus()));
        log.info("Kafka sent payment-completed from API: orderId={}, status={}", saved.getOrderId(), saved.getStatus());

        return saved;
    }

    public DummyPaymentResponse processDummyPayment(DummyPaymentRequest request) {
        String status = (request.status() == null || request.status().isBlank()) ? "SUCCESS" : request.status().toUpperCase();
        String method = (request.paymentMethod() == null || request.paymentMethod().isBlank()) ? "DUMMY_CARD" : request.paymentMethod();

        Payment payment = new Payment();
        payment.setOrderId(request.orderId());
        payment.setAmount(request.amount());
        payment.setStatus(status);
        payment.setCreatedAt(LocalDateTime.now());
        Payment saved = repo.save(payment);

        // Emit event to Kafka so Order Service updates status to CONFIRMED or CANCELLED, and Notification Service notifies user
        kafka.send("payment-completed", String.valueOf(saved.getOrderId()),
                new PaymentCompletedEvent(saved.getOrderId(), saved.getAmount(), saved.getStatus()));
        log.info("Kafka sent payment-completed from dummy-pay API: orderId={}, status={}", saved.getOrderId(), saved.getStatus());

        String txnId = "TXN-" + System.currentTimeMillis() + "-" + (int) (Math.random() * 9000 + 1000);
        String message = "SUCCESS".equalsIgnoreCase(status)
                ? "Dummy payment authorized successfully! Order #" + request.orderId() + " confirmed via Kafka."
                : "Dummy payment declined! Order #" + request.orderId() + " cancelled via Kafka.";

        return new DummyPaymentResponse(
                txnId,
                saved.getOrderId(),
                saved.getAmount(),
                method,
                status,
                message,
                saved.getCreatedAt()
        );
    }

    public List<Payment> getAll() {
        return repo.findAll();
    }

    public Payment get(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    public Payment update(Long id, PaymentRequest request) {
        Payment payment = get(id);
        payment.setOrderId(request.orderId());
        payment.setAmount(request.amount());
        payment.setStatus(request.status());
        return repo.save(payment);
    }

    public void delete(Long id) {
        repo.delete(get(id));
    }

    public void process(InventoryReservedEvent e) {
        String status = forceFailure ? "FAILED" : "SUCCESS";
        Payment p = new Payment();
        p.setOrderId(e.orderId());
        p.setAmount(e.amount());
        p.setStatus(status);
        p.setCreatedAt(LocalDateTime.now());
        repo.save(p);
        kafka.send("payment-completed", String.valueOf(e.orderId()),
                new PaymentCompletedEvent(e.orderId(), p.getAmount(), p.getStatus()));
        log.info("Kafka sent payment-completed: orderId={}, status={}", e.orderId(), p.getStatus());
    }
}
