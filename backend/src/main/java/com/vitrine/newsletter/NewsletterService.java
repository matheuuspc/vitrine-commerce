package com.vitrine.newsletter;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class NewsletterService {
    private final NewsletterSubscriptionRepository subscriptions;
    private final ObjectProvider<JavaMailSender> mailSender;
    private final String smtpHost;
    private final String fromAddress;

    public NewsletterService(NewsletterSubscriptionRepository subscriptions,
                             ObjectProvider<JavaMailSender> mailSender,
                             @Value("${spring.mail.host:}") String smtpHost,
                             @Value("${app.mail.from:}") String fromAddress) {
        this.subscriptions = subscriptions;
        this.mailSender = mailSender;
        this.smtpHost = smtpHost;
        this.fromAddress = fromAddress;
    }

    @Transactional
    public void subscribe(String rawEmail) {
        if (smtpHost.isBlank() || fromAddress.isBlank() || mailSender.getIfAvailable() == null) {
            throw new NewsletterUnavailableException("O cadastro por e-mail está temporariamente indisponível.");
        }

        String email = rawEmail.trim().toLowerCase(Locale.ROOT);
        if (subscriptions.existsByEmail(email)) return;

        subscriptions.saveAndFlush(new NewsletterSubscription(email));
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(email);
        message.setSubject("Boas-vindas à Vitrine");
        message.setText("Seu e-mail foi cadastrado para receber novidades e ofertas da Vitrine.\n\nSe você não solicitou este cadastro, ignore esta mensagem.");
        try {
            mailSender.getObject().send(message);
        } catch (MailException exception) {
            throw new NewsletterUnavailableException("Não foi possível enviar o e-mail agora. Tente novamente mais tarde.");
        }
    }
}
