package com.ecommerce.payment.service;
import com.ecommerce.common.event.*;
import com.ecommerce.payment.entity.Payment;
import com.ecommerce.payment.repository.PaymentRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class PaymentService {
 private final PaymentRepository repo; private final KafkaTemplate<String,Object> kafka;
 public PaymentService(PaymentRepository repo,KafkaTemplate<String,Object> kafka){this.repo=repo;this.kafka=kafka;}

 public void process(InventoryReservedEvent e){
   // Demo payment: always succeeds. Replace this section with Stripe/Razorpay/etc. in production.
   Payment p=new Payment(); p.setOrderId(e.orderId()); p.setAmount(BigDecimal.ZERO);
   p.setStatus("SUCCESS"); p.setCreatedAt(LocalDateTime.now()); repo.save(p);
   kafka.send("payment-completed",String.valueOf(e.orderId()),
      new PaymentCompletedEvent(e.orderId(),p.getAmount(),p.getStatus()));
 }
}
