package com.wipro.ecom.order_management.controller;

import com.wipro.ecom.order_management.entity.Cart;
import com.wipro.ecom.order_management.entity.CartItem;
import com.wipro.ecom.order_management.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@Tag(name = "Shopping Cart Management", description = "APIs for viewing and managing a user's shopping cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Operation(summary = "Get the user's shopping cart by their user ID")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved cart")
    @GetMapping("/{userId}")
    @PreAuthorize("#userId == authentication.principal")
    public ResponseEntity<Cart> viewCart(@PathVariable Integer userId) {
        return ResponseEntity.ok(cartService.getCartByUserId(userId));
    }

    @Operation(summary = "Add an item to the shopping cart")
    @ApiResponse(responseCode = "200", description = "Item successfully added to cart")
    @PostMapping("/{userId}/add")
    @PreAuthorize("#userId == authentication.principal")
    public ResponseEntity<Cart> addProductToCart(@PathVariable Integer userId, @RequestBody CartItem item) {
        return ResponseEntity.ok(cartService.addProductToCart(userId, item));
    }

    @Operation(summary = "Update the quantity of a specific item in the cart")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item quantity updated successfully"),
            @ApiResponse(responseCode = "404", description = "Item not found in cart")
    })
    @PutMapping("/{userId}/update/{productId}")
    @PreAuthorize("#userId == authentication.principal")
    public ResponseEntity<Cart> updateQuantity(@PathVariable Integer userId, @PathVariable Integer productId, @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateCartItemQuantity(userId, productId, quantity));
    }
    
    @Operation(summary = "Remove an item from the shopping cart")
    @ApiResponse(responseCode = "200", description = "Item successfully removed from cart")
    @DeleteMapping("/{userId}/delete/{productId}")
    @PreAuthorize("#userId == authentication.principal")
    public ResponseEntity<Cart> deleteProductFromCart(@PathVariable Integer userId, @PathVariable Integer productId) {
        return ResponseEntity.ok(cartService.removeProductFromCart(userId, productId));
    }
}
