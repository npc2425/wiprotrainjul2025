package com.wipro.ecom.product_management.service;

import com.wipro.ecom.product_management.entity.Product;
import com.wipro.ecom.product_management.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Integer id) {
        return productRepository.findById(id);
    }

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Integer id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setProdName(productDetails.getProdName());
        product.setProdDesc(productDetails.getProdDesc());
        product.setProdCat(productDetails.getProdCat());
        product.setAvailableQty(productDetails.getAvailableQty());
        product.setPrice(productDetails.getPrice());
        product.setUom(productDetails.getUom());
        product.setImageURL(productDetails.getImageURL());
        
        return productRepository.save(product);
    }

    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }

    // This method is for internal service-to-service communication
    @Transactional
    public Product updateStock(Integer productId, int quantityChange) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        int newQuantity = product.getAvailableQty() + quantityChange;
        if (newQuantity < 0) {
            throw new RuntimeException("Not enough stock available for product id: " + productId);
        }
        product.setAvailableQty(newQuantity);
        return productRepository.save(product);
    }
}
