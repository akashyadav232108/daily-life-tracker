package com.tracker.notification.service;

import com.tracker.notification.model.entity.DailySummary;
import com.tracker.notification.model.entity.Streak;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;

/**
 * Sends HTML emails via Gmail SMTP using Thymeleaf templates.
 *
 * All send methods are @Async — email sending must NEVER block the main thread.
 * Failures are logged but not re-thrown (fire-and-forget).
 */
@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine emailTemplateEngine;

    @Value("${app.email.from}")
    private String fromAddress;

    @Value("${app.email.from-name}")
    private String fromName;

    public EmailService(JavaMailSender mailSender,
                        @Qualifier("emailTemplateEngine") TemplateEngine emailTemplateEngine) {
        this.mailSender = mailSender;
        this.emailTemplateEngine = emailTemplateEngine;
    }

    // ══════════════════════════════════════════════════════════
    //  BUDGET ALERT EMAIL
    // ══════════════════════════════════════════════════════════

    /**
     * Send an immediate budget alert email when spending crosses 80% or 100%.
     * Triggered by ExpenseEventConsumer on BUDGET_EXCEEDED events.
     *
     * @param toEmail     recipient email address (from the Kafka event)
     * @param category    expense category (e.g. "FOOD")
     * @param percentUsed percentage of budget used (e.g. 85.0)
     */
    @Async
    public void sendBudgetAlert(String toEmail, String category, double percentUsed) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Budget alert email skipped — no email address provided for category={}", category);
            return;
        }

        try {
            Context ctx = new Context();
            ctx.setVariable("category", category);
            ctx.setVariable("percentUsed", String.format("%.0f", percentUsed));
            ctx.setVariable("isExceeded", percentUsed >= 100);

            String html = emailTemplateEngine.process("budget-alert", ctx);
            String subject = percentUsed >= 100
                    ? "🚨 Budget Exceeded — " + category
                    : "⚠️ Budget Alert — " + category + " (" + String.format("%.0f", percentUsed) + "% used)";

            send(toEmail, subject, html);
            log.info("Budget alert email sent to {} — category={} percent={}%", toEmail, category, percentUsed);
        } catch (Exception e) {
            log.error("Failed to send budget alert email to {}: {}", toEmail, e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════
    //  DAILY SUMMARY EMAIL
    // ══════════════════════════════════════════════════════════

    /**
     * Send the evening daily summary email.
     * Triggered by EveningSummaryJob at 9 PM.
     *
     * @param toEmail  recipient email address
     * @param summary  today's DailySummary entity (from DB)
     * @param streaks  list of user's streak records
     */
    @Async
    public void sendDailySummary(String toEmail, DailySummary summary, List<Streak> streaks) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Daily summary email skipped — no email address for user {}", summary.getUserId());
            return;
        }

        try {
            Context ctx = new Context();
            ctx.setVariable("date", summary.getSummaryDate().toString());
            ctx.setVariable("tasksTotal", summary.getTasksTotal());
            ctx.setVariable("tasksCompleted", summary.getTasksCompleted());
            ctx.setVariable("healthLogged", summary.getHealthLogged());
            ctx.setVariable("exerciseLogged", summary.getExerciseLogged());
            ctx.setVariable("totalSpent", summary.getTotalSpent());
            ctx.setVariable("mood", summary.getMood());
            ctx.setVariable("streaks", streaks);

            String html    = emailTemplateEngine.process("daily-summary", ctx);
            String subject = "📊 Your Daily Summary — " + summary.getSummaryDate();

            send(toEmail, subject, html);
            log.info("Daily summary email sent to {} for date {}", toEmail, summary.getSummaryDate());
        } catch (Exception e) {
            log.error("Failed to send daily summary email to {}: {}", toEmail, e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════
    //  PRIVATE HELPER
    // ══════════════════════════════════════════════════════════

    private void send(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromAddress, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true); // true = HTML
        mailSender.send(message);
    }
}
