package com.tracker.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templateresolver.ITemplateResolver;

/**
 * Configures a dedicated Thymeleaf TemplateEngine for HTML email rendering.
 *
 * Resolves templates from classpath:templates/email/
 * All styles must be inline in templates — Gmail App strips <style> blocks.
 */
@Configuration
public class MailConfig {

    /**
     * Thymeleaf template resolver pointing to classpath:templates/email/
     */
    @Bean
    public ITemplateResolver authEmailTemplateResolver() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/email/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false);
        resolver.setOrder(1);
        resolver.setCheckExistence(true);
        return resolver;
    }

    /**
     * Dedicated Thymeleaf engine used only for email rendering in auth-service.
     * Named "authEmailTemplateEngine" to avoid conflict with Spring's default web engine.
     */
    @Bean(name = "authEmailTemplateEngine")
    public TemplateEngine authEmailTemplateEngine() {
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.addTemplateResolver(authEmailTemplateResolver());
        return engine;
    }
}
