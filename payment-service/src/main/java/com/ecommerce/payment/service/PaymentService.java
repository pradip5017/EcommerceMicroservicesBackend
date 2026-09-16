package com.ecommerce.payment.service;
import com.ecommerce.common.event.*;
import com.ecommerce.payment.dto.PaymentRequest;
import com.ecommerce.payment.entity.Payment;
import com.ecommerce.payment.repository.PaymentRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {
 private final PaymentRepository repo; private final KafkaTemplate<String,Object> kafka;
 public PaymentService(PaymentRepository repo,KafkaTemplate<String,Object> kafka){this.repo=repo;this.kafka=kafka;}

 public Payment create(PaymentRequest request){
   Payment payment=new Payment();
   payment.setOrderId(request.orderId());
   payment.setAmount(request.amount());
   payment.setStatus(request.status());
   payment.setCreatedAt(LocalDateTime.now());
   return repo.save(payment);
 }

 public List<Payment> getAll(){return repo.findAll();}

 public Payment get(Long id){
   return repo.findById(id).orElseThrow(()->new RuntimeException("Payment not found with id: " + id));
 }

 public Payment update(Long id, PaymentRequest request){
   Payment payment=get(id);
   payment.setOrderId(request.orderId());
   payment.setAmount(request.amount());
   payment.setStatus(request.status());
   return repo.save(payment);
 }

 public void delete(Long id){repo.delete(get(id));}

 public void process(InventoryReservedEvent e){
   // Demo payment: always succeeds. Replace this section with Stripe/Razorpay/etc. in production.
   Payment p=new Payment(); p.setOrderId(e.orderId()); p.setAmount(BigDecimal.ZERO);
   p.setStatus("SUCCESS"); p.setCreatedAt(LocalDateTime.now()); repo.save(p);
   kafka.send("payment-completed",String.valueOf(e.orderId()),
      new PaymentCompletedEvent(e.orderId(),p.getAmount(),p.getStatus()));
 }
}
