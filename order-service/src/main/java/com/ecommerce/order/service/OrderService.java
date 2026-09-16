package com.ecommerce.order.service;
import com.ecommerce.common.event.*;
import com.ecommerce.order.dto.*;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.repository.OrderRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class OrderService {
 private final OrderRepository repo; private final KafkaTemplate<String,Object> kafka;
 public OrderService(OrderRepository repo,KafkaTemplate<String,Object> kafka){this.repo=repo;this.kafka=kafka;}

 public Order create(CreateOrderRequest r){
   Order o=new Order(); o.setUserId(r.userId()); o.setProductId(r.productId());
   o.setQuantity(r.quantity()); o.setAmount(r.amount()); o.setStatus(Order.Status.PENDING);
   o.setCreatedAt(LocalDateTime.now()); o=repo.save(o);
   kafka.send("order-created",String.valueOf(o.getId()),
      new OrderCreatedEvent(o.getId(),o.getUserId(),o.getProductId(),o.getQuantity(),o.getAmount()));
   return o;
 }
 public Order get(Long id){return repo.findById(id).orElseThrow(()->new RuntimeException("Order not found"));}

 public void inventoryReserved(InventoryReservedEvent e){
   Order o=get(e.orderId()); o.setStatus(Order.Status.INVENTORY_RESERVED); repo.save(o);
   kafka.send("inventory-reserved-for-payment",String.valueOf(o.getId()),e);
 }
 public void paymentCompleted(PaymentCompletedEvent e){
   Order o=get(e.orderId());
   o.setStatus("SUCCESS".equalsIgnoreCase(e.status())?Order.Status.CONFIRMED:Order.Status.FAILED);
   repo.save(o);
   if(o.getStatus()==Order.Status.CONFIRMED)
     kafka.send("order-confirmed",String.valueOf(o.getId()),
        new OrderConfirmedEvent(o.getId(),o.getAmount(),"CONFIRMED"));
 }
 public void inventoryFailed(OrderCreatedEvent e){
   Order o=get(e.orderId()); o.setStatus(Order.Status.FAILED); repo.save(o);
 }
}
