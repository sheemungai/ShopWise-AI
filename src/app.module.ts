import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { CustomersModule } from './customers/customers.module';
import { SellersModule } from './sellers/sellers.module';
import { AuthModule } from './auth/auth.module';
import { AtGuard } from './auth/guards';
import { LoggerMiddleware } from './logger.middleware';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    DatabaseModule,
    CustomersModule,
    SellersModule,
    AuthModule,
    CategoriesModule,
  ],
  controllers: [],
  providers: [{ provide: 'APP_GUARD', useClass: AtGuard }],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('users');
  }
}
