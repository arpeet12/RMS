package com.manpower.controller.api;

import com.manpower.entity.News;
import com.manpower.repository.NewsRepository;
import com.manpower.util.FileUploadUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsApiController {

    private final NewsRepository newsRepository;

    public NewsApiController(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    @GetMapping
    public ResponseEntity<List<News>> getAllNews() {
        return ResponseEntity.ok(newsRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNews(@PathVariable Long id) {
        return newsRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createNews(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "photo", required = false) MultipartFile photo) throws IOException {

        News news = new News();
        news.setTitle(title);
        news.setContent(content);

        if (photo != null && !photo.isEmpty()) {
            String fileName = StringUtils.cleanPath(photo.getOriginalFilename());
            news.setPhotoPath("/uploads/news/" + fileName);
            FileUploadUtil.saveFile("uploads/news/", fileName, photo);
        }

        return ResponseEntity.ok(newsRepository.save(news));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateNews(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "photo", required = false) MultipartFile photo) throws IOException {

        Optional<News> newsOpt = newsRepository.findById(id);
        if (newsOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        News news = newsOpt.get();
        news.setTitle(title);
        news.setContent(content);

        if (photo != null && !photo.isEmpty()) {
            String fileName = StringUtils.cleanPath(photo.getOriginalFilename());
            news.setPhotoPath("/uploads/news/" + fileName);
            FileUploadUtil.saveFile("uploads/news/", fileName, photo);
        }

        return ResponseEntity.ok(newsRepository.save(news));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteNews(@PathVariable Long id) {
        if (!newsRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        newsRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
