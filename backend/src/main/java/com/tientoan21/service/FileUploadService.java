package com.tientoan21.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FileUploadService {
    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file){
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));

            return uploadResult.get("url").toString();
        }catch (IOException e){
            throw new RuntimeException("Error uploading images to Cloudinary");
        }
    }
    public List<String> uploadMultipleFiles(List<MultipartFile> files){
        return files.stream()
                .map(this::uploadFile)
                .toList();
    }
}
