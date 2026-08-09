# Movie Reservation Infrastructure Project

## 개요

React 기반 영화 예매 서비스를 Web/WAS/DB 3-Tier 구조로 설계하고,  
VMware 가상화 환경과 AWS 클라우드 환경에 각각 배포한 인프라 구축 프로젝트입니다.

단순 애플리케이션 기능 구현보다 서버 구성, 네트워크 분리, Nginx Reverse Proxy, WAS systemd 서비스 운영, MariaDB 연동, 보안 그룹 및 방화벽 설정, Shell Script 기반 운영 자동화, Kubernetes 컨테이너 배포까지 확장하는 것을 목표로 했습니다.

최종적으로 로컬 개발 환경에서 시작해 VMware 3-Tier, AWS 3-Tier, Kubernetes 기반 Web/WAS 배포까지 단계적으로 확장하며 Web → WAS → DB 통신 흐름을 검증했습니다.

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

## AWS 3-Tier 배포

- VPC: 10.0.0.0/16
- Public Subnet: web-subnet
- Private Subnet: was-subnet, db-subnet
- Web EC2: Nginx + React Build
- WAS EC2: Node.js Express + systemd
- DB EC2: MariaDB
- Web → WAS → DB 방향으로만 통신 허용

## 운영 자동화 Shell Script

VMware 및 AWS 환경에서 Web/WAS/DB 서버의 상태를 수동으로 점검하고, 장애 발생 시 서비스 재시작 및 DB 백업을 수행할 수 있도록 Shell Script를 작성했습니다.

### 주요 스크립트

| 스크립트 | 설명 |
| --- | --- |
| health-check-web.sh | Nginx 상태, API 응답, WAS 포트, 디스크/메모리 사용량 점검 |
| health-check-was.sh | movie-api 서비스 상태, 로컬 API 응답, DB 포트 연결, 디스크/메모리 사용량 점검 |
| health-check-db.sh | MariaDB 서비스 상태, DB/테이블 조회, 디스크/메모리 사용량 점검 |
| service-restart.sh | 지정한 systemd 서비스를 재시작하고 정상 기동 여부 확인 |
| backup-db.sh | MariaDB movie_reservation 데이터베이스 백업 |

### 자동화 목적

- 서버 상태 점검 절차 표준화
- 장애 발생 시 빠른 원인 확인
- 서비스 재시작 절차 단순화
- DB 백업 작업 자동화

## Kubernetes 배포

기존 VM 기반 Web/WAS 구조를 컨테이너 이미지로 전환하고, kubeadm 기반 Kubernetes 클러스터에 배포했습니다.

### 클러스터 구성

| 노드 | IP | 역할 | 설명 |
| --- | --- | --- | --- |
| k8s01 | 192.168.56.40 | Control Plane | Kubernetes API Server, Scheduler, Controller Manager, etcd |
| k8s02 | 192.168.56.50 | Worker Node | movie-web Pod, movie-was Pod 실행 |
| db01 | 192.168.56.30 | External DB | 기존 MariaDB 서버 사용 |

### Kubernetes 구성 요소

| 리소스 | 설명 |
| --- | --- |
| Deployment | Web/WAS Pod 생성 및 장애 시 자동 복구 |
| Service | Pod 접근을 위한 고정 네트워크 엔드포인트 제공 |
| ConfigMap | WAS 환경변수 관리 |
| Secret | DB 비밀번호 관리 |
| NodePort | 외부 브라우저에서 Web 서비스 접근 |
| Calico CNI | Pod 네트워크 구성 |

### 배포 구조

Browser → k8s02:30080 → movie-web-service → movie-web Pod → movie-was-service → movie-was Pod → db01 MariaDB

### 주요 작업

- kubeadm 기반 Kubernetes 클러스터 구성
- k8s01 control-plane, k8s02 worker node 분리
- containerd 컨테이너 런타임 구성
- Calico CNI 기반 Pod 네트워크 구성
- Web/WAS Dockerfile 작성
- podman으로 Web/WAS 이미지 빌드
- containerd k8s.io namespace에 이미지 import
- ConfigMap/Secret으로 WAS 환경변수 분리
- WAS Deployment 및 ClusterIP Service 구성
- Web Deployment 및 NodePort Service 구성
- Web → WAS → DB 전체 통신 검증

### 접속 URL

- Kubernetes Web: http://192.168.56.50:30080

## 주요 트러블슈팅

### 1. Nginx Reverse Proxy 502 오류

- 문제: Web 서버에서 WAS API로 프록시 요청 시 502 Bad Gateway 발생
- 원인: SELinux가 Nginx의 외부 네트워크 연결을 차단
- 해결: `httpd_can_network_connect` 설정 활성화
- 결과: Web → WAS API 프록시 정상 동작 확인

### 2. AWS Web → WAS 통신 실패

- 문제: Web EC2에서 WAS EC2의 3001 포트로 접근 실패
- 원인: WAS 보안 그룹 인바운드 규칙에 Web SG 허용 누락
- 해결: WAS SG에 Web SG 기준 TCP 3001 허용
- 결과: Web EC2에서 WAS API 호출 성공

### 3. Kubernetes Worker Node NotReady

- 문제: k8s02 worker node가 NotReady 상태로 표시
- 원인: Calico CNI 설정 파일이 정상 생성되지 않아 CNI plugin not initialized 발생
- 해결: k8s02의 CNI 설정 초기화 후 kubelet/containerd 재시작, Calico Pod 재생성
- 결과: k8s02 Ready 상태 전환

### 4. kubectl logs 10250 연결 실패

- 문제: `kubectl logs` 실행 시 k8s02의 10250 포트 연결 실패
- 원인: control-plane에서 worker node kubelet API 포트 접근 불가
- 해결: 실습 환경에서 firewalld 비활성화 후 10250 포트 통신 확인
- 결과: `kubectl logs deployment/movie-was` 정상 확인

### 5. WAS Pod MariaDB 접속 권한 오류

- 문제: movie-was Pod가 MariaDB 접속 실패로 Error 상태 발생
- 로그: `Host '192.168.56.50' is not allowed to connect to this MariaDB server`
- 원인: MariaDB 계정이 k8s02 worker node IP에서의 접속을 허용하지 않음
- 해결: db01에서 `movieuser` 계정에 `192.168.56.50` 또는 `192.168.56.%` 접속 권한 추가
- 결과: WAS Pod → db01 MariaDB 연결 성공
