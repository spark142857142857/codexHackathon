# 계획서 및 아이디어 발전

- **트럼프**
    
    # 기획안
    
    ## 1. 서비스 한 줄 소개
    
    **Market Mover는 도널드 트럼프와 일론 머스크처럼 시장 영향력이 큰 인물의 SNS 게시물과 주가 데이터를 연결해, 어떤 발언이 어떤 종목과 시장에 얼마나 큰 단기 반응을 일으켰는지 탐색하는 인터랙티브 웹 대시보드다.**
    
    ## 2. 문제 정의
    
    개인 투자자와 리서처는 주가 급등락을 확인한 뒤, 그 시점에 어떤 정보가 시장에 나왔는지 따로 찾아야 한다. 특히 SNS 발언은 뉴스보다 빠르게 확산되고 시장 심리에 영향을 줄 수 있지만, 일반 주가 차트만으로는 다음 질문에 답하기 어렵다.
    
    - 당시 누가 어떤 게시물을 올렸는가?
    - 게시물 전후 관련 종목은 얼마나 움직였는가?
    - 반응은 특정 종목에만 나타났는가, 시장 전체로 퍼졌는가?
    - 어떤 주제와 감정의 게시물에서 반응이 크게 나타나는가?
    - engagement가 큰 게시물일수록 시장 반응도 컸는가?
    
    Market Mover는 SNS 게시물을 하나의 **시장 이벤트(Event)** 로 정의하고, 게시물 발생 시점과 주가 데이터를 같은 화면에서 연결해 이 문제를 해결한다.
    
    ## 3. 핵심 사용자와 가치
    
    ### 개인 투자자
    
    - 특정 종목 급등락 시점에 관련 SNS 이벤트가 있었는지 빠르게 확인할 수 있다.
    - 단순 가격 변화가 아니라 발언, 주제, 감정, engagement까지 함께 본다.
    
    ### 리서처와 학생
    
    - 이벤트 스터디 결과를 복잡한 표가 아니라 인터랙티브 화면으로 탐색할 수 있다.
    - 인물별, 주제별, 종목별 반응 차이를 직관적으로 비교할 수 있다.
    
    ### 금융 서비스 확장 관점
    
    - 향후 실시간 SNS/뉴스 수집, 관심 종목 알림, LLM 기반 발언 요약 기능으로 확장할 수 있다.
    - “SNS 기반 시장 리스크 모니터링”이라는 실사용 가능성이 있다.
    
    ## 4. 핵심 컨셉
    
    ### 서비스 이름
    
    **Market Mover**
    
    이름 자체가 “시장을 움직이는 발언/사람/이벤트”를 직관적으로 전달한다. 발표 제목과 서비스 화면 모두에 쓰기 좋다.
    
    ### 핵심 질문
    
    **“영향력 있는 인물의 어떤 SNS 발언에서 시장이 가장 크게 반응했으며, 그 반응은 얼마나 지속되었는가?”**
    
    단, 서비스는 SNS 게시물이 주가 변화의 직접 원인이라고 단정하지 않는다. 게시물 전후 가격, 거래량, 변동성의 **연관성과 패턴을 탐색하는 도구**로 포지셔닝한다.
    
    ## 5. 분석 범위
    
    ### 기간
    
    **2023.01.01 - 2025.04.13**
    
    선정 이유:
    
    - 트럼프와 머스크 데이터를 함께 커버할 수 있는 공통 구간이다.
    - 트럼프의 후보/시민 시기와 2025년 1월 20일 대통령 복귀 초기 구간을 포함한다.
    - 트럼프의 2021-2022년 플랫폼 전환기, 머스크의 2022년 X 인수 직후 구조 변화, 코로나와 금리 급등기 영향을 피할 수 있다.
    
    ### 인물
    
    - Donald Trump
    - Elon Musk
    
    ### 주요 종목과 지수
    
    - Musk: TSLA 기본, QQQ 보조
    - Trump: SPY 기본, QQQ 보조
    - 대조군: GM, F, RIVN
    
    ## 6. 데이터 구성
    
    ### SNS 데이터
    
    Trump:
    
    - Kaggle Trump_2009_2025.csv
    - X와 Truth Social 통합 데이터
    - engagement는 데이터 품질을 고려해 기본적으로 likes 중심 사용
    
    Musk:
    
    - all_musk_posts.csvx`
    - musk_quote_tweets.csv
    - 원본, 리트윗, 답글, 인용 포함
    - 2023년 이후 viewCount 결측이 크게 줄어들어 Track1 기간에 활용 가능
    
    ### 주가 데이터
    
    - yfinance 또는 사전 수집 가격 데이터 사용
    - TSLA, SPY, QQQ, GM, F, RIVN
    - MVP는 일봉 기준으로 구현
    - 확장 버전에서 30분, 1시간, 3시간 단위 분봉 분석 추가
    
    ## 7. 주요 기능
    
    ### 1. Market Mover Overview
    
    첫 화면에서 전체 상황을 바로 보여준다.
    
    - 분석 기간
    - 이벤트 수
    - 평균 Market Impact Score
    - 고위험 이벤트 수
    - 평균 abnormal return
    - 가장 영향력이 큰 인물과 토픽
    
    ### 2. Tweet x Stock Timeline
    
    가장 중요한 핵심 기능이다.
    
    - 주가 라인 차트 위에 SNS 게시물 발생 시점을 이벤트 마커로 표시한다.
    - 마커를 클릭하면 게시물 본문, 인물, 플랫폼, topic, sentiment, engagement, 게시 후 수익률을 보여준다.
    - 사용자는 “이 주가 급등락 시점에 어떤 발언이 있었는가?”를 바로 확인할 수 있다.
    
    ### 3. Impact Ranking
    
    시장 반응이 컸던 게시물을 순위로 보여준다.
    
    - Market Impact Score TOP 이벤트
    - 인물별 TOP 이벤트
    - 토픽별 TOP 이벤트
    - 종목별 TOP 이벤트
    
    ### 4. Event Detail
    
    선택한 게시물을 깊게 볼 수 있는 상세 패널이다.
    
    - 게시물 본문
    - 작성자와 플랫폼
    - 관련 종목
    - topic과 sentiment
    - likes, reposts, views
    - event window 수익률
    - abnormal return
    - 거래량 변화
    - 변동성 변화
    
    ### 5. Topic and Sentiment Analysis
    
    게시물의 내용 특성에 따라 시장 반응이 달라지는지 보여준다.
    
    - Trump: tariff, China, trade, Fed, economy, company attack
    - Musk: Tesla, production, autonomous driving, AI, EV competition
    - Positive / Neutral / Negative 또는 Calm / Heated / Market Shock
    
    ## 8. Market Impact Score
    
    주가를 직접 예측한다고 말하지 않고, 게시물이 단기 변동성 이벤트로 얼마나 주목할 만한지 점수화한다.
    
    예시:
    
    ```
    Market Impact Score =
      |Abnormal Return|
      + Volume Change
      + Volatility Change
      + Engagement Percentile
      + Person-Ticker Relevance
    ```
    
    MVP에서는 데모용 계산식을 사용하고, 실제 분석 단계에서는 이벤트 스터디 결과와 연결한다.
    
    점수 구간:
    
    - 0-49: Calm
    - 50-79: Heated
    - 80-100: Market Shock
    
    ## 9. 제품 화면 구성
    
    ### 첫 화면
    
    - 상단: 서비스명, 문제 정의, Track1 기간
    - 중앙: KPI 카드 4개
    - 좌측: 이벤트 타임라인
    - 중앙: 선택 이벤트 상세와 수익률 차트
    - 우측: 토픽별 반응, 확장 가능성, 분석 방법 요약
    
    ### 필터
    
    - 인물: All / Trump / Musk
    - 종목: All / TSLA / SPY / QQQ / GM / F / RIVN
    - 토픽
    - 위험도
    - 기간
    
    ### 차트
    
    외부 BI 도구를 쓰지 않고 React 웹앱 안에서 직접 구현한다.
    
    - 이벤트 전후 수익률 라인 차트
    - 종목별 반응 막대 차트
    - 토픽별 평균 반응 랭킹
    - Impact Score 랭킹
    
    ## 10. 기술 구현 방향
    
    ### MVP
    
    - React + Vite 기반 단일 웹앱
    - 외부 차트 라이브러리 없이 SVG/HTML/CSS 차트 구현
    - 샘플 이벤트 데이터 내장
    - 필터링, 이벤트 선택, KPI 갱신, 차트 갱신 구현
    
    ### 확장 구조
    
    샘플 데이터는 이후 CSV 전처리 결과 JSON으로 교체할 수 있게 설계한다.
    
    예시 event table:
    
    | 변수 | 설명 |
    | --- | --- |
    | event_id | 이벤트 ID |
    | person | 작성자 |
    | platform | X 또는 Truth Social |
    | datetime | 게시 시간 |
    | text | 게시물 본문 |
    | topic | 주제 |
    | sentiment | 감성 |
    | likes | 좋아요 |
    | reposts | 리포스트 |
    | views | 조회수 |
    | ticker | 관련 종목 |
    | return_0d | 당일 수익률 |
    | return_1d | 게시 후 1일 수익률 |
    | abnormal_return | 초과수익률 |
    | volume_change | 거래량 변화 |
    | volatility_change | 변동성 변화 |
    | impact_score | 시장 영향도 점수 |
    
    ## 11. 평가 기준 대응
    
    ### 기술적 구현과 안정성
    
    - 자체 React 대시보드로 Tableau 없이 구현한다.
    - 필터링, 상태 관리, SVG 차트, 반응형 UI를 구현한다.
    - 데이터 구조를 샘플에서 실제 CSV 기반 JSON으로 확장 가능하게 만든다.
    
    ### 제품 완성도와 사용자 경험
    
    - 사용자는 앱을 열자마자 가장 위험한 이벤트와 관련 종목 반응을 확인할 수 있다.
    - 이벤트 리스트, 상세 카드, 차트, 토픽 분석이 한 화면에서 연결된다.
    - 발표자가 클릭 몇 번으로 Trump 정책형 이벤트, Musk TSLA 직결형 이벤트, QQQ 비직결 이벤트를 시연할 수 있다.
    
    ### 문제와 아이디어 명확성
    
    - 문제: SNS 발언과 주가 변동을 따로 봐야 해서 시장 반응의 맥락을 놓치기 쉽다.
    - 해결: SNS 게시물을 시장 이벤트로 정의하고 주가 데이터와 같은 시간축에 연결한다.
    
    ### 잠재적 영향력과 사용자 가치
    
    - 투자자에게는 급변 원인 후보를 빠르게 파악하는 도구가 된다.
    - 리서처에게는 이벤트 스터디 결과를 탐색하는 분석 도구가 된다.
    - 금융 서비스에는 SNS/뉴스 기반 리스크 알림 기능으로 확장 가능하다.
    
    ### 행사 이후 발전 가능성
    
    - 실제 CSV 데이터 연결
    - yfinance 기반 자동 가격 업데이트
    - 실시간 SNS/뉴스 수집
    - 종목 자동 매핑
    - FinBERT 또는 LLM 기반 topic/sentiment 분류
    - 이벤트 스터디 통계 검정
    - 관심 종목 알림
    - Track2 최신 사건 케이스스터디 추가
    
    ## 12. 발표용 데모 시나리오
    
    ### 시나리오 1. Musk -> TSLA 직결형
    
    Musk의 Tesla 관련 발언을 선택한다.
    
    - TSLA 이벤트 전후 수익률 확인
    - RIVN, GM, F와 비교
    - 직결 기업과 peer group 반응 차이 설명
    
    ### 시나리오 2. Trump -> SPY/QQQ 정책형
    
    Trump의 tariff 또는 China 관련 발언을 선택한다.
    
    - SPY와 QQQ 반응 비교
    - 정책 발언이 시장 전체로 퍼지는 구조 설명
    - tariff topic의 평균 반응 강조
    
    ### 시나리오 3. 정치 권력과 기업가 발언이 섞이는 고위험 이벤트
    
    2025년 Trump 대통령 복귀 초기와 Musk 정부 관련 발언을 연결한다.
    
    - 단순 기업 발언이 아니라 정치적 권한과 시장 영향력이 결합되는 사례로 설명
    - Track2 최신 사건 분석으로 확장 가능함을 강조
    
    ## 13. 최종 포지셔닝
    
    Market Mover는 주가를 맞히는 서비스가 아니라, **시장을 움직일 수 있는 SNS 발언을 탐지하고 그 전후의 시장 반응을 설명하는 이벤트 인텔리전스 서비스**다.
    
    이 포지셔닝은 예측 실패 리스크를 줄이면서도, 실제 투자자와 리서처에게 가치 있는 제품으로 보이게 한다.
    
    - 플랜모드
        
        # Market Mover 구현형 기획안
        
        ## Summary
        
        **Market Mover**는 시장 영향력이 큰 공적 인물의 SNS 게시물을 하나의 `Market Event`로 정의하고, 게시물 전후의 주가·초과수익률·거래량·변동성 변화를 한 화면에서 탐색하는 React 기반 인터랙티브 웹서비스다.
        
        서비스의 핵심 질문은 다음과 같다.
        
        > 어떤 공개 SNS 발언 전후에 어떤 종목·지수가 얼마나 크게 반응했는가?
        > 
        
        정치적 평가나 인과관계 단정이 아니라, **공개 발언과 시장 반응의 연관성 및 패턴 탐색**을 목표로 한다.
        
        ## Product Concept
        
        - 서비스명: **Market Mover**
        - 형태: Tableau 없는 자체 웹 대시보드
        - 대상 기간: `2023.01.01 - 2025.04.13`
        - 주요 인물:
            - Elon Musk: 기업 직결형 인물
            - Donald Trump: 정책 영향형 공적 인물
        - 주요 자산:
            - Musk: TSLA, QQQ, GM, F, RIVN
            - Trump: SPY, QQQ
        - 핵심 포지셔닝:
            - 주가를 맞히는 서비스가 아니라, **SNS 기반 시장 이벤트 인텔리전스 서비스**
        
        ## Core User Flow
        
        1. 사용자가 대시보드에 진입한다.
        2. 상단 KPI에서 전체 이벤트 수, 평균 Impact Score, 고위험 이벤트 수, 평균 abnormal return을 확인한다.
        3. 인물/종목 필터를 선택한다.
        4. 좌측 이벤트 타임라인에서 관심 게시물을 클릭한다.
        5. 중앙 상세 패널에서 게시물 본문, 주제, 감정 강도, engagement, 관련 종목을 확인한다.
        6. 이벤트 전후 수익률 차트와 peer 반응 차트로 시장 반응을 비교한다.
        7. 우측 Impact Ranking과 Topic 분석으로 어떤 유형의 발언이 더 큰 반응을 보였는지 확인한다.
        
        ## Key Features
        
        ### 1. Market Overview
        
        - 분석 기간 표시
        - 전체 이벤트 수
        - 평균 Market Impact Score
        - 고위험 이벤트 수
        - 평균 abnormal return
        - 현재 필터 기준 최고 위험 이벤트 표시
        
        ### 2. Event Feed
        
        - SNS 게시물을 시간순 이벤트로 표시
        - 각 이벤트에 인물, 플랫폼, topic, ticker, impact score 표시
        - `Calm`, `Heated`, `Market Shock` 상태 배지 제공
        - 클릭 시 상세 패널과 차트가 즉시 갱신됨
        
        ### 3. Event Detail
        
        - 게시물 본문
        - 작성자와 플랫폼
        - 게시 시각
        - likes, reposts, views
        - topic
        - sentiment/tone
        - related tickers
        - 왜 이 이벤트가 flag 되었는지 설명
        
        ### 4. Market Reaction Charts
        
        - 이벤트 전후 수익률 라인 차트:
            - `1D`, `0D`, `+1D`, `+3D`
        - 종목별 당일 반응 비교 막대 차트:
            - 예: TSLA vs RIVN vs GM vs F
        - 외부 BI 도구 없이 SVG/HTML/CSS로 구현
        
        ### 5. Impact Ranking
        
        - Market Impact Score 기준 TOP 이벤트
        - 클릭 시 해당 이벤트 상세로 이동
        - 발표 시 “가장 시장 반응이 컸던 게시물”을 빠르게 보여줄 수 있음
        
        ### 6. Topic Analysis
        
        - topic별 이벤트 수
        - topic별 평균 절대 반응
        - 고위험 이벤트 수
        - 예시 topic:
            - Tariff / China
            - Tesla / EV
            - AI / Chips
            - Policy / Presidency
            - Company Attack
        
        ## Data Model
        
        MVP에서는 샘플 JSON 데이터를 앱 내부에 내장하고, 이후 CSV 전처리 결과로 교체 가능하게 설계한다.
        
        ```jsx
        event = {
          id: string,
          person: 'Musk' | 'Trump',
          platform: 'X' | 'Truth Social',
          datetime: string,
          text: string,
          topic: string,
          ticker: string,
          relatedTickers: string[],
          likes: number,
          reposts: number,
          views: number | null,
          tone: 'Calm' | 'Heated' | 'Market Shock',
          impactScore: number,
          priceWindow: {
            '-1D': number,
            '0D': number,
            '+1D': number,
            '+3D': number
          },
          abnormalReturn: number,
          summary: string,
          rationale: string[]
        }
        ```
        
        ## Market Impact Score
        
        주가 예측 대신 “단기 시장 반응 가능성이 높은 이벤트인지”를 점수화한다.
        
        ```
        Market Impact Score =
          |Abnormal Return|
          + Volume Change
          + Volatility Change
          + Engagement Percentile
          + Person-Ticker Relevance
        ```
        
        MVP에서는 데모용 점수를 사용한다. 실제 데이터 연결 후에는 이벤트 스터디 기반 지표로 교체한다.
        
        점수 구간:
        
        - `0-49`: Calm
        - `50-79`: Heated
        - `80-100`: Market Shock
        
        ## Evaluation Fit
        
        ### 기술적 구현과 안정성
        
        - React + Vite 기반 단일 웹앱
        - 상태 기반 필터링
        - 이벤트 선택에 따른 KPI/상세/차트 동시 갱신
        - 외부 차트 라이브러리 없이 SVG 차트 구현
        - 샘플 데이터에서 실제 JSON 데이터로 교체 가능한 구조
        
        ### 제품 완성도와 사용자 경험
        
        - 앱 진입 즉시 “가장 위험한 이벤트”와 “시장 반응”을 확인 가능
        - 좌측 이벤트 feed, 중앙 상세 분석, 우측 ranking/insight 구조
        - 발표자가 클릭 몇 번으로 핵심 시나리오를 시연 가능
        - 모바일에서는 패널이 세로로 자연스럽게 재배치됨
        
        ### 문제와 아이디어 명확성
        
        - 문제: 주가 데이터와 SNS 정보를 따로 봐야 해서 시장 급변의 맥락을 놓치기 쉽다.
        - 해결: SNS 게시물을 시장 이벤트로 정의하고 주가 반응과 같은 시간축에 연결한다.
        
        ### 잠재적 영향력과 사용자 가치
        
        - 개인 투자자: 급등락 시점의 정보 이벤트를 빠르게 확인
        - 리서처/학생: 이벤트 스터디 결과를 인터랙티브하게 탐색
        - 금융 서비스: SNS/뉴스 기반 리스크 알림 기능으로 확장 가능
        
        ### 행사 이후 발전 가능성
        
        - 실제 CSV 데이터 연결
        - yfinance 기반 가격 자동 업데이트
        - 실시간 SNS/뉴스 수집
        - LLM 기반 topic/sentiment 분류
        - 종목 자동 매핑
        - 이벤트 스터디 통계 검정
        - 관심 종목 알림
        - Track2 최신 사건 케이스스터디 추가
        
        ## Demo Scenarios
        
        ### Scenario 1. Musk -> TSLA 직결형
        
        - Musk 필터 선택
        - TSLA 선택
        - Tesla/EV 이벤트 클릭
        - TSLA 수익률과 RIVN, GM, F peer 반응 비교
        - 설명 포인트: CEO 발언은 직결 기업과 peer group에 다르게 반응할 수 있음
        
        ### Scenario 2. Trump -> SPY/QQQ 정책형
        
        - Trump 필터 선택
        - QQQ 또는 SPY 선택
        - Tariff / China 이벤트 클릭
        - 이벤트 전후 QQQ 하락과 abnormal return 확인
        - 설명 포인트: 정책형 발언은 개별 기업보다 지수 전체에 확산될 수 있음
        
        ### Scenario 3. 고위험 이벤트 탐색
        
        - All 필터 유지
        - Impact Ranking TOP 이벤트 클릭
        - Market Shock 배지와 Impact Score 확인
        - 설명 포인트: 사용자는 시장 반응이 컸던 발언을 빠르게 역추적할 수 있음
        
        ## Implementation Plan
        
        - 기존 Markdown 앱을 Market Mover 대시보드로 전면 교체
        - `src/main.jsx`:
            - 샘플 event data
            - 필터 상태
            - KPI 계산
            - 이벤트 선택 로직
            - SVG 라인 차트
            - 종목별 막대 차트
            - ranking/criteria/demo panel 구현
        - `src/styles.css`:
            - 밝은 금융 분석 도구 톤
            - 고대비 KPI 카드
            - 위험도 배지
            - 반응형 3열 대시보드 레이아웃
        - `index.html`:
            - title과 description을 Market Mover에 맞게 수정
        
        ## Test Plan
        
        - `npm run build` 성공 확인
        - 필터 테스트:
            - All / Musk / Trump
            - TSLA / SPY / QQQ / GM / F / RIVN
        - 이벤트 선택 테스트:
            - 이벤트 클릭 시 상세 카드, 차트, score가 갱신되는지 확인
        - 반응형 테스트:
            - 데스크톱 3열 레이아웃
            - 태블릿 2열 레이아웃
            - 모바일 1열 레이아웃
        - 발표 시나리오 테스트:
            - Musk -> TSLA
            - Trump -> QQQ
            - Impact Ranking TOP 이벤트
        
        ## Assumptions
        
        - v1은 실제 분석 완료본이 아니라 **제품화 가능한 프론트 데모**를 우선한다.
        - 샘플 수치는 발표용 mock data이며, 실제 CSV 전처리 결과로 교체 가능하게 만든다.
        - Trump는 정치적 평가 대상이 아니라, 선행연구와 공개 데이터가 풍부한 “시장 영향력이 큰 공적 인물 사례”로 중립적으로 사용한다.
        - 서비스 문구는 “인과관계 단정”이 아니라 “전후 시장 반응 탐색”으로 유지한다.
- 기본적으로는 **“주가”**
- 여기에 비트코인도 추가
- 보조
    
    SNS 게시물·뉴스·공시를 일종의 `Signal(기준)` 로 활용
    
    - 뉴스 발행
    - 해시태그
    - 언급빈도수
    - 금융, 주가이외에도 다른 파급력들은 각자 어떠한지 비교해볼수도 있는
- 시장 영향력의 종류를 비교하는
    - 반도체 지수
    - QQQ, 비트코인, SPY 를 기본으로 하고 관련 지수 섹터를 넣거나 자기 회사 지수를 넣는 방향으로 해보는 걸로

### 데이터

- 청문회
    
    https://www.techpolicy.press/transcript-senate-judiciary-subcommittee-hearing-on-oversight-of-ai/
    
    ⇒ 발언자별 텍스트 있어서 NLP 분석 가능
    
- 일론머스크
    
    https://www.kaggle.com/datasets/dadalyndell/elon-musk-tweets-2010-to-2025-march
    
    [musk_quote_tweets.csv](musk_quote_tweets.csv)
    
    [all_musk_posts.csv](all_musk_posts.csv)
    
- 트럼프
    
    https://www.kaggle.com/datasets/datadrivendecision/trump-tweets-2009-2025/data
    
    [Kaggle Trump_2009_2025.csv](Kaggle_Trump_2009_2025.csv)
    
- 샘 올트먼
    
    최근 인기 top50 좋아요 기준으로 정리
    
    https://superx.so/tweets/sam-altman
    
    샘 올트면/오픈 AI 팟캐스트 관련 X 게시물 예시 데이터세트
    
    https://huggingface.co/datasets/Gopher-Lab/Sam_Altman_OpenAI_Podcast_XScraper_Example
    
    샘 올트먼들의 인터뷰, 글, 증언, 검증된 인용문을 모아둔 독립 아카이브
    
    https://samsaid.ai/
    
- 수익화
    - free: 기본 인물 2명, 기본 종목 5개 일별 업데이트 최근 7일 이벤트만 보고
    - pro: 관심인물, 종목 추가, 실시간 및 준실시간 업데이트, 뉴스/해시테크/언급량 추적, 알림추적/ 이벤트 리포트 저장
        - 원하는 유명인사 추가시에 돈 더내기
        - 유명인사가 본인 추가를 희망할 경우 돈 받기
- 크롤링을 추적하도록 하는 것의 관리
    - 수동 업데이트
    - 데이터셋은 지금까지의 추세와 파급력 확인에 사용, 크롤링은 실제 서비스 시에 제공
    - X(트위터) API - 확장성