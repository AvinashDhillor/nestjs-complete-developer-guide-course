import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { Report } from './reports.entity';
import { ReportsController } from './reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  providers: [ReportsService],
  controllers: [ReportsController]
})
export class ReportsModule { }
