package com.tracker.auth.config;

import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import io.lettuce.core.codec.RedisCodec;
import io.lettuce.core.codec.StringCodec;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

import java.time.Duration;

/**
 * Creates the Bucket4j LettuceBasedProxyManager bean.
 * This proxy manager stores token-bucket state in Redis,
 * making rate limiting distributed-safe across multiple instances.
 */
@Configuration
public class RateLimitConfig {

    @Bean
    @ConditionalOnProperty(name = "rate.limit.enabled", havingValue = "true", matchIfMissing = true)
    public LettuceBasedProxyManager<String> rateLimitProxyManager(RedisConnectionFactory connectionFactory) {
        LettuceConnectionFactory lettuceFactory = (LettuceConnectionFactory) connectionFactory;
        RedisClient nativeClient = (RedisClient) lettuceFactory.getNativeClient();

        StatefulRedisConnection<String, byte[]> connection =
                nativeClient.connect(RedisCodec.of(StringCodec.UTF8, ByteArrayCodec.INSTANCE));

        return LettuceBasedProxyManager.builderFor(connection)
                .withExpirationStrategy(
                        ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(
                                Duration.ofHours(2)))
                .build();
    }
}
