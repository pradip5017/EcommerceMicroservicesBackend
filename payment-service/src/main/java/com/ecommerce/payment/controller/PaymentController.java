package com.ecommerce.payment.controller;

import com.ecommerce.payment.dto.DummyPaymentRequest;
import com.ecommerce.payment.dto.DummyPaymentResponse;
import com.ecommerce.payment.dto.PaymentRequest;
import com.ecommerce.payment.entity.Payment;
import com.ecommerce.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @PostMapping
    public Payment create(@Valid @RequestBody PaymentRequest request) {
        return service.create(request);
    }

    @PostMapping("/dummy-pay")
    public DummyPaymentResponse dummyPay(@Valid @RequestBody DummyPaymentRequest request) {
        return service.processDummyPayment(request);
    }

    @GetMapping
    public List<Payment> all() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Payment get(@PathVariable Long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public Payment update(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
