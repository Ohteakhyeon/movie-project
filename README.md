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
- npm run install:all
- cp .env.example .env
- cp was/.env.example was/.env
- npm run db:up
- npm run dev

## 확인 URL
- Web: http://localhost:5173
- WAS: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## VMware 3-Tier 배포

### 서버 구성

| 서버 | IP | 역할 | 구성 |
|---|---|---|---|
| web01 | 192.168.56.10 | Web Server | Nginx, React Build |
| was01 | 192.168.56.20 | WAS Server | Node.js, Express, systemd |
| db01 | 192.168.56.30 | DB Server | MariaDB |

### 통신 구조

사용자 브라우저 → web01 Nginx → was01 Node.js API → db01 MariaDB

### 주요 작업
- Rocky Linux VM 3대 생성
- 고정 IP 및 hostname 설정
- Nginx 정적 파일 배포
- Nginx Reverse Proxy 설정
- Node.js API systemd 서비스 등록
- MariaDB DB 생성 및 계정 권한 설정
- firewalld 포트 허용
- Web → WAS → DB 연결 검증


