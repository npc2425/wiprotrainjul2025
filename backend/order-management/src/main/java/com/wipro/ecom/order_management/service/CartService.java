package com.wipro.ecom.order_management.service;

import com.wipro.ecom.order_management.entity.Cart;
import com.wipro.ecom.order_management.entity.CartItem;
import com.wipro.ecom.order_management.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    public Cart getCartByUserId(Integer userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));
    }

    private Cart createCartForUser(Integer userId) {
        Cart newCart = new Cart();
        newCart.setUserId(userId);
        return cartRepository.save(newCart);
    }
    
    @Transactional
    public Cart addProductToCart(Integer userId, CartItem newItem) {
        Cart cart = getCartByUserId(userId);
        
        // Check if item already exists in cart
        cart.getItems().stream()
            .filter(item -> item.getProductId().equals(newItem.getProductId()))
            .findFirst()
            .ifPresentOrElse(
                // If present, update quantity
                item -> item.setQuantity(item.getQuantity() + newItem.getQuantity()),
                // If not present, add new item
                () -> {
                    newItem.setCart(cart);
                    cart.getItems().add(newItem);
                }
            );

        return cartRepository.save(cart);
    }
    
    @Transactional
    public Cart updateCartItemQuantity(Integer userId, Integer productId, int quantity) {
        Cart cart = getCartByUserId(userId);
        CartItem itemToUpdate = cart.getItems().stream()
            .filter(item -> item.getProductId().equals(productId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Item not found in cart"));
        
        itemToUpdate.setQuantity(quantity);
        return cartRepository.save(cart);
    }
    
    @Transactional
    public Cart removeProductFromCart(Integer userId, Integer productId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        return cartRepository.save(cart);
    }
}
