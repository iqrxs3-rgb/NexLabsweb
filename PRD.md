# NexLabs - Product Requirements Document (PRD)

## 1. نظرة عامة على المشروع

**NexLabs** هو تطبيق ويب متكامل يعتمد على الذكاء الاصطناعي، يتيح للمستخدمين:
- التفاعل مع Chatbot ذكي
- إنشاء الصور بالذكاء الاصطناعي
- تحويل الصوت إلى نص (Transcription)
- تشغيل أكواد البرمجة مباشرة

---

## 2. الميزات الرئيسية

### 2.1 المصادقة (Authentication)
- تسجيل الدخول وتسجيل الخروج
- نظام JWT مع NextAuth

### 2.2 المحادثات (Chat)
- واجهة محادثة ذكية مع AI
- حفظ المحادثات السابقة
- إدارة المحادثات (إنشاء، حذف، عرض)

### 2.3 إنشاء الصور (Image Generation)
- إنشاء صور بالذكاء الاصطناعي
- حفظ الصور
- عرض سجل الصور

### 2.4 تحويل الصوت (Voice Transcription)
- رفع ملفات صوتية
- تحويل الصوت إلى نص

### 2.5 محرر الأكواد (Code Editor)
- محرر أكواد Monaco
- تشغيل الأكواد
- إدارة ملفات الأكواد

---

## 3. التقنيات المستخدمة

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components
- Monaco Editor

### Backend
- Next.js API Routes
- Prisma ORM
- NextAuth.js

### Database
- PostgreSQL (via Prisma)

### الخدمات الخارجية
- Groq SDK (للذكاء الاصطناعي)
- Docker (لتشغيل الأكواد)

---

## 4. هيكل المشروع

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # تسجيل الدخول
│   │   ├── chat/          # محادثة AI
│   │   ├── code/          # تشغيل الأكواد
│   │   ├── conversations/ # إدارة المحادثات
│   │   ├── image/         # إنشاء الصور
│   │   ├── messages/      # الرسائل
│   │   ├── projects/     # المشاريع
│   │   └── voice/        # تحويل الصوت
│   ├── dashboard/        # لوحة التحكم
│   ├── login/            # صفحة تسجيل الدخول
│   ├── register/         # صفحة التسجيل
│   └── page.tsx          # الصفحة الرئيسية
├── components/           # مكونات React
│   ├── ui/              # مكونات UI
│   ├── ChatTab.tsx      # تبويب المحادثة
│   ├── CodeTab.tsx      # تبويب الأكواد
│   ├── ImagesTab.tsx    # تبويب الصور
│   └── VoiceTab.tsx     # تبويب الصوت
├── lib/                  # مكتبات مساعدة
│   ├── auth.ts          # إعدادات NextAuth
│   ├── db.ts            # اتصال Prisma
│   └── utils.ts         # أدوات مساعدة
└── middleware.ts        # Middleware للـ Auth

prisma/
└── schema.prisma        # مخطط قاعدة البيانات
```

---

## 5. قاعدة البيانات (Prisma Schema)

### النماذج الرئيسية:
- **User**: المستخدمون
- **Conversation**: المحادثات
- **Message**: الرسائل
- **Project**: المشاريع
- **Image**: الصور المُنشأة
- **CodeFile**: ملفات الأكواد

---

## 6. نقاط النهاية (API Endpoints)

### المصادقة
- `POST /api/auth/register` - تسجيل مستخدم جديد

### المحادثات
- `GET /api/conversations` - قائمة المحادثات
- `POST /api/conversations` - إنشاء محادثة
- `DELETE /api/conversations/[id]` - حذف محادثة

### الرسائل
- `GET /api/messages` - رسائل المحادثة
- `POST /api/chat` - إرسال رسالة لـ AI

### الصور
- `POST /api/image/save` - حفظ صورة
- `GET /api/image/history` - سجل الصور

### الصوت
- `POST /api/voice/transcribe` - تحويل الصوت لنص

### الأكواد
- `GET /api/code/files` - قائمة الملفات
- `POST /api/code/files` - إنشاء ملف
- `POST /api/code/run` - تشغيل الكود

---

## 7. أوامر التشغيل

```bash
# التطوير
npm run dev

# البناء
npm run build

# الفحص
npm run lint

# توليد Prisma
npx prisma generate

# تشغيل Migration
npx prisma migrate dev
```

---

## 8. المتطلبات

- Node.js 18+
- PostgreSQL
- Docker (للـ Code Runner)
