package com.ecommerce.product.controller;

import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
 private final ProductRepository repo;
 public ProductController(ProductRepository repo){this.repo=repo;}

 @PostMapping public Product create(@Valid @RequestBody ProductRequest r){
   Product p=new Product(); copy(r,p); return repo.save(p);
 }
 @GetMapping public Page<Product> all(@RequestParam(defaultValue="0") int page,
                                      @RequestParam(defaultValue="10") int size){
   return repo.findAll(PageRequest.of(page,size,Sort.by("id").descending()));
 }
 @GetMapping("/{id}") public Product get(@PathVariable Long id){
   return repo.findById(id).orElseThrow(()->new RuntimeException("Product not found"));
 }
 @PutMapping("/{id}") public Product update(@PathVariable Long id,@Valid @RequestBody ProductRequest r){
   Product p=get(id); copy(r,p); return repo.save(p);
 }
 @DeleteMapping("/{id}") public void delete(@PathVariable Long id){repo.deleteById(id);}
 private void copy(ProductRequest r,Product p){
   p.setName(r.name()); p.setDescription(r.description()); p.setPrice(r.price());
   p.setCategory(r.category()); p.setImageUrl(r.imageUrl());
 }
}
