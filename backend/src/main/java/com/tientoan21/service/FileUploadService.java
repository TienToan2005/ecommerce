package com.tientoan21.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
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

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        try {
            String publicId = extractPublicIdFromUrl(fileUrl);

            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

            log.info("Đã dọn dẹp file cũ trên Cloudinary: {} - Trạng thái: {}", publicId, result.get("result"));

        } catch (Exception e) {
            log.error("Lỗi khi xóa file cũ trên Cloud: {}. Nguyên nhân: {}", fileUrl, e.getMessage());
        }
    }
    private String extractPublicIdFromUrl(String fileUrl) {
        try {
            int uploadIndex = fileUrl.indexOf("/upload/");
            if (uploadIndex == -1) return fileUrl;

            String afterUpload = fileUrl.substring(uploadIndex + 8);

            int firstSlashIndex = afterUpload.indexOf("/");
            String pathWithoutVersion = afterUpload.substring(firstSlashIndex + 1);

            int dotIndex = pathWithoutVersion.lastIndexOf(".");
            if (dotIndex != -1) {
                return pathWithoutVersion.substring(0, dotIndex);
            }

            return pathWithoutVersion;
        } catch (Exception e) {
            log.warn("Không thể bóc tách public_id từ URL: {}", fileUrl);
            return fileUrl;
        }
    }
}
