import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    providers: [NotificationService],
    exports: [NotificationService],
    imports: [FirebaseModule, UsersModule]
})
export class NotificationModule { }
