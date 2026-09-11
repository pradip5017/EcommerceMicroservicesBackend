package com.ecommerce.payment.controller;
import com.ecommerce.payment.entity.Payment;
import com.ecommerce.payment.repository.PaymentRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/payments")
public class PaymentController {
 private final PaymentRepository repo;
 public PaymentController(PaymentRepository repo){this.repo=repo;}
 @GetMapping public List<Payment> all(){return repo.findAll();}
 @GetMapping("/{id}") public Payment get(@PathVariable Long id){
   return repo.findById(id).orElseThrow(()->new RuntimeException("Payment not found"));
 }
}
