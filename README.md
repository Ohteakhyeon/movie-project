# Movie Reservation 3-Tier Project

## 개요
React 기반 영화 예매 서비스를 Web/WAS/DB 3-Tier 구조로 구성한 프로젝트입니다.

## 기술 스택
- Web: React, TypeScript, Vite
- WAS: Node.js, Express
- DB: MariaDB
- Local DB: Docker Compose

## 주요 기능
- 영화 목록 조회
- 좌석 선택
- 예매 등록
- 예매 내역 조회
- MariaDB 예매 데이터 저장

## 실행 방법
npm run install:all
cp .env.example .env
cp was/.env.example was/.env
npm run db:up
npm run dev

## 확인 URL
- Web: http://localhost:5173
- WAS: http://localhost:3001
- Health Check: http://localhost:3001/api/health
