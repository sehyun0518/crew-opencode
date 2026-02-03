# crew-opencode
> **"값싼 행위는 값싼 에이전트에게, 고도화된 사고는 최고의 모델에게."**

[English](README.md) | [한국어](README.ko.md)

## 📑 목차

- [소개 (Introduction)](#-소개-introduction)
- [핵심 철학 (Core Philosophy)](#-핵심-철학-core-philosophy)
- [조직도 (The Crew)](#-조직도-the-crew)
- [주요 기능 (Features)](#-주요-기능-features)
- [설치 및 실행 (Installation)](#-설치-및-실행-installation)
- [기여하기 (Contributing)](#-기여하기-contributing)

# 🚀 소개 (Introduction)

**crew-opencode**는 "협업"이라는 키워드에서 시작했습니다. 모든 에이전트가 비싼 모델일 필요는 없습니다. 우리는 적재적소에 맞는 모델을 배치하여 토큰 낭비를 줄이고, 결과물의 품질을 극대화합니다.

당신이 `crew` 명령어를 입력하는 순간, 당신은 단순한 사용자가 아닌 **엄격한 관리자(Manager)**가 됩니다. 에이전트들은 당신이 정한 절차와 규율에 맞춰 유기적으로 움직입니다.

## 💡 핵심 철학 (Core Philosophy)
1.  **Cost-Effective**: 단순 반복 작업은 경량화 모델에게, 복잡한 추론은 고성능 모델에게 위임합니다.
2.  **Specialization**: 모든 것을 다 잘하는 제너럴리스트보다, 본인의 직무(Role)에 특화된 전문가 에이전트를 지향합니다.
3.  **Accountability**: 작업 실패 시 명확한 원인 분석(시말서)을 통해 재발을 방지합니다.

## 👥 조직도 (The Crew)
우리 크루는 다양한 도구와 컨텍스트는 에이전트에게 다재다능을 부여하지만, 본인의 직무에 맞춘 개별 에이전트를 통해 보다 **전문성**있고 보다 **자기가 잘하는 일**만 수행할 수 있도록 합니다.

| Role | Position | Model (Example) | Description |
| :--- | :--- | :--- | :--- |
| **PM** | Project Manager | Opus 4.5 | 전체 프로젝트를 조율하고 우선순위를 결정합니다. 병렬로 작동하는 팀원들을 감독합니다. |
| **TA** | **Technical Analyst** | Claude Sonnet 4.5 | **(New!)** 공식 문서(Docs) 리서치, 오픈 소스 구현체 탐색, 레거시 코드베이스를 정밀 분석합니다. |
| **FE** | UI/UX Engineer | Gemini 3 Pro | 최신 트렌드를 반영하여 사용자 인터페이스를 구현하고 프론트엔드 로직을 개발합니다. |
| **Design** | Designer | GPT 5.2 Medium | UI/UX 플로우를 검토하고 디자인 시스템을 제안합니다. |
| **QA** | Quality Assurance | Claude Haiku 4.5 | 단위 테스트(Unit Test) 및 E2E 테스트를 수행하며, 코드의 안정성을 검증합니다. |

---

## ✨ 주요 기능 (Features)

### 1. `crew` Command System
마치 엄격한 부서장처럼 에이전트들에게 업무를 지시합니다. 모호한 명령 대신, 구조화된 절차(SOP)를 강제하여 에이전트가 딴길로 새는 것을 방지합니다.

### 2. 자동 시말서 생성 (Apology Letter / Incident Report)
팀원(에이전트)이 업무 수행 도중 에러를 발생시키거나 중단될 경우, 즉시 **시말서**를 작성합니다.
* **발생 원인**: 왜 멈췄는가?
* **리스크 분석**: 이 에러가 프로젝트에 미치는 영향은 무엇인가?
* **재발 방지 대책**: 다음엔 어떻게 할 것인가?
* *이는 단순한 로그가 아닌, 에이전트 스스로의 회고(Self-Reflection) 프로세스입니다.*

---

## 📦 설치 및 실행 (Installation)

OpenCode가 설치되어 있어야 합니다.

```bash
# Install OpenCode first
curl -fsSL https://opencode.ai/install | bash

# Install crew-opencode plugin
bunx crew-opencode install
```

## Quick Start

```bash
# Run with default workflow
opencode

# Or execute a specific workflow
bunx crew-opencode run feature
```

## 🤝 기여하기 (Contributing)
더 나은 에이전트 기반의 코딩 환경을 만들기 위해 노력하고 있습니다. 현재의 방식이 최선이 아닐 수 있음을 인정하며, 여러분의 지혜를 기다립니다.
- 새로운 직무(Role) 제안
- 프롬프트 엔지니어링 개선
- 버그 제보 및 수정
- etc..

모든 PR은 환영입니다. 함께 성장하는 조직이 되어주세요!
<p align="center"> © 2026 crew-opencode. All rights reserved. </p>