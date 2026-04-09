package service;

import dto.request.ProductRequest;
import dto.response.ProductResponse;
import entity.Category;
import entity.Product;
import enums.ErrorCode;
import exception.AppException;
import lombok.RequiredArgsConstructor;
import mapper.ProductMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.CategoryRepository;
import repository.ProductRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private  final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;

    public ProductResponse createProduct(ProductRequest request){
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        Product product = new Product();

        product.setName(request.name());
        product.setPrice(request.price());
        product.setImages(request.images());
        product.setStock(request.stock());
        product.setCategory(category);
        product.setSpecifications(request.specifications());
        product.setDescription(request.description());

        Product saved = productRepository.save(product);
        return productMapper.toProductResponse(saved);
    }
    public Page<ProductResponse> getALlProduct(int page, int size){
        Page<Product> products = productRepository.findAll(PageRequest.of(page, size));

        return products.map(productMapper::toProductResponse);

    }
    public Page<ProductResponse> getAllProductByCategory(Long categoryId, int page, int size){
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size);

        Page<Product> productPage = productRepository.findAllByCategoryId(categoryId, pageable);

        return productPage.map(productMapper::toProductResponse);
    }
    public ProductResponse getProductById(Long id){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        return productMapper.toProductResponse(product);
    }
    @Transactional
    public ProductResponse updateProductById(Long id, ProductRequest request){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if(request.categoryId() != null){
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            product.setCategory(category);
        }

        productMapper.updateProductFromRequest(request,product);
        Product saved = productRepository.save(product);

        return productMapper.toProductResponse(saved);
    }
    @Transactional
    public void deleteProduct(Long id){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        product.setDeleteAt(LocalDateTime.now());
    }
}
