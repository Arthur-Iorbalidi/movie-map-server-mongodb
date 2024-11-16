import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [UserModule, AuthModule],
})
export class ReportsModule {}
