package com.tracker.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;

/**
 * OtpEmailService — sends OTP password-reset emails via Gmail SMTP.
 *
 * Template: classpath:templates/email/otp-reset.html
 * All CSS styles are inlined — Gmail App (iOS/Android) strips <style> blocks.
 * Template is also rendered using MSO-safe table layouts for Outlook compatibility.
 */
@Service
@Slf4j
public class OtpEmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine emailTemplateEngine;

    @Value("${app.email.from}")
    private String fromAddress;

    @Value("${app.email.from-name}")
    private String fromName;

    public OtpEmailService(JavaMailSender mailSender,
                           @Qualifier("authEmailTemplateEngine") TemplateEngine emailTemplateEngine) {
        this.mailSender = mailSender;
        this.emailTemplateEngine = emailTemplateEngine;
    }

    /**
     * Send a password-reset OTP email.
     * This method is @Async — it does NOT block the HTTP request thread.
     * The OTP is already stored in Redis before this method is called.
     *
     * @param toEmail         the user's registered email address
     * @param otp             the 6-digit OTP to include in the email
     * @param expiryMinutes   how many minutes the OTP is valid (shown in email)
     */
    @Async
    public void sendOtpEmail(String toEmail, String otp, long expiryMinutes) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("OTP email skipped — no email address provided");
            return;
        }

        try {
            Context ctx = new Context();
            ctx.setVariable("otp", otp);
            ctx.setVariable("expiryMinutes", expiryMinutes);

            String html    = emailTemplateEngine.process("otp-reset", ctx);
            String subject = "🔐 Your Password Reset OTP — Daily Life Tracker";

            send(toEmail, subject, html);
            log.info("OTP email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    // ── Private helper ────────────────────────────────────────────

    private void send(String to, String subject, String htmlBody)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromAddress, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true); // true = send as HTML
        mailSender.send(message);
    }
}
