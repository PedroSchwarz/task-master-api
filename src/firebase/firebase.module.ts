import { Global, Module, OnModuleInit } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';

@Global()
@Module({
    providers: [FirebaseService],
    exports: [FirebaseService],
})
export class FirebaseModule implements OnModuleInit {
    onModuleInit() {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT ?? '{}');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
}
