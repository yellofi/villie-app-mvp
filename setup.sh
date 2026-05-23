#!/bin/bash
# 파일명: setup.sh
# 실행 방법: chmod +x setup.sh && ./setup.sh

echo "🚀 Villie 프로젝트 초기화를 시작합니다..."

# 1. 백엔드 세팅
echo "📦 백엔드(Node.js) 의존성을 설치합니다..."
mkdir -p backend
cd backend
npm init -y
npm install @supabase/supabase-js dotenv
npm install -D typescript @types/node ts-node nodemon
cd ..

# 2. 프론트엔드 세팅
echo "📱 프론트엔드(Expo) 스캐폴딩을 진행합니다..."
npx create-expo-app@latest frontend --template blank
cd frontend
npx expo install expo-location expo-image-picker
cd ..

echo "✅ 모든 초기 세팅이 완료되었습니다."