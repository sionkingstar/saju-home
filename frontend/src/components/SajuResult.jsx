import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

const ResultContainer = styled(motion.div)`
  width: 100%;
  max-width: 850px;
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-top: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  color: #222;
  font-family: 'Pretendard', sans-serif;
`;

const SectionTitle = styled.h3`
  font-family: 'Noto Serif KR', serif;
  font-size: 24px;
  font-weight: 900;
  color: #311B92;
  margin: 35px 0 20px;
  padding-bottom: 10px;
  border-bottom: 3px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 10px;
`;

/* 오행 색상 클래스 대체 스타일 */
const getColor = (char) => {
  const map = {
    '甲': '#2e7d32', '乙': '#2e7d32', '寅': '#2e7d32', '卯': '#2e7d32', // Wood (Green)
    '丙': '#d32f2f', '丁': '#d32f2f', '巳': '#d32f2f', '午': '#d32f2f', // Fire (Red)
    '戊': '#ef6c00', '己': '#ef6c00', '辰': '#ef6c00', '戌': '#ef6c00', '丑': '#ef6c00', '未': '#ef6c00', // Earth (Orange)
    '庚': '#546e7a', '辛': '#546e7a', '申': '#546e7a', '酉': '#546e7a', // Metal (Gray)
    '壬': '#1565c0', '癸': '#1565c0', '亥': '#1565c0', '子': '#1565c0'  // Water (Blue)
  };
  return map[char] || '#222';
};

/* --- 1. 사주 원국 스타일 --- */
const SajuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 2px solid #ddd;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 30px;
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr); /* 모바일에서는 2열로 */
  }
`;

const PillarCol = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  border-right: 2px solid #ddd;
  background: white;
  &:last-child { border-right: none; }
  @media (max-width: 600px) {
    &:nth-child(2n) { border-right: none; } /* 2열마다 선 제거 */
    border-bottom: 2px solid #ddd;
    &:nth-last-child(-n+2) { border-bottom: none; }
  }
`;

const ColHeader = styled.div`
  background: #e9ecef;
  padding: 12px 0;
  font-size: 18px;
  color: #222;
  font-weight: 900;
  border-bottom: 2px solid #ddd;
`;

const Cell = styled.div`
  padding: 15px 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  border-bottom: 2px solid #eee;
`;

const Hanja = styled.span`
  font-family: 'Noto Serif KR', serif;
  font-size: 40px;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 5px;
  color: ${props => getColor(props.char)};
`;

const Sipseong = styled.span`
  font-size: 16px;
  color: #555;
  font-weight: 800;
  margin-top: 5px;
`;

const SinsalBox = styled.div`
  background: #fafafa;
  padding: 10px 5px;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
`;

const SinsalTag = styled.span`
  background: white;
  border: 2px solid #ddd;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
  color: #444;
  font-weight: 800;
`;

/* --- 2. 대운 스타일 --- */
const DaeunScroll = styled.div`
  overflow-x: auto;
  padding-bottom: 10px;
  margin-bottom: 30px;
  &::-webkit-scrollbar { height: 8px; }
  &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
`;

const DaeunTable = styled.table`
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  text-align: center;
  th {
    padding: 15px 10px;
    border-right: 1px solid #ddd;
    background: white;
    min-width: 60px;
  }
`;

const DaeunAge = styled.span`
  font-size: 20px;
  color: #512DA8;
  font-weight: 900;
  display: block;
  margin-bottom: 8px;
`;

/* --- 3. 세운/월운 스타일 --- */
const SewunTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);

  th {
    background: #f8f9fa;
    padding: 15px;
    color: #333;
    font-weight: 900;
    border-bottom: 2px solid #ddd;
    font-size: 17px;
  }
  td {
    padding: 15px 5px;
    text-align: center;
    border-bottom: 1px solid #eee;
    font-size: 17px;
    font-weight: 600;
    vertical-align: middle;
  }
`;

const YearRow = styled.tr`
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background-color: #e3f2fd; }
  background-color: ${props => props.isOpen ? '#e8eaf6' : 'transparent'};
`;

const MonthRow = styled(motion.tr)`
  background-color: #fafafa;
`;

const MonthInnerTable = styled.table`
  width: 95%;
  margin: 10px auto;
  border: 2px solid #ddd;
  background: white;
  border-radius: 8px;
  
  th {
    background: linear-gradient(to right, #c31432, #240b36);
    color: white;
    font-size: 15px;
    padding: 8px;
    border-bottom: none;
  }
  td {
    font-size: 15px;
    padding: 8px;
    border-bottom: 1px solid #eee;
  }
`;

const Highlight = styled.span`
  color: #d32f2f;
  font-weight: 900;
`;

/* --- CTA 버튼 --- */
const CtaContainer = styled.div`
  margin-top: 40px;
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(36,11,54,0.05), rgba(195,20,50,0.05));
  border-radius: 20px;
  border: 2px dashed rgba(195,20,50,0.3);
`;

const CtaTitle = styled.h4`
  font-size: 20px;
  color: #444;
  margin-bottom: 20px;
  font-weight: bold;
`;

const PremiumButton = styled(motion.button)`
  background: linear-gradient(45deg, #FFD700, #FFA500, #FF6347);
  color: white;
  border: none;
  padding: 20px 40px;
  border-radius: 50px;
  font-size: 22px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(255, 99, 71, 0.5);
  }
`;

export default function SajuResult({ data, onConsultClick }) {
  const [expandedYear, setExpandedYear] = useState(null);

  if (!data) return null;

  // data.pillar.data order from backend: [Hour, Day, Month, Year]
  const pillarRaw = data.pillar.data;
  // Map to Titles: Hour, Day, Month, Year
  const pillars = [
    { title: '시주 (말년)', data: pillarRaw[0] },
    { title: '일주 (본인)', data: pillarRaw[1] },
    { title: '월주 (사회)', data: pillarRaw[2] },
    { title: '년주 (조상)', data: pillarRaw[3] }
  ];

  const toggleYear = (idx) => {
    setExpandedYear(expandedYear === idx ? null : idx);
  };

  return (
    <ResultContainer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SectionTitle>💎 사주 원국</SectionTitle>

      <SajuGrid>
        {pillars.map((p, idx) => {
          const ganji = p.data[1]; // "甲子"
          const sipseong = p.data[2].split('/'); // "비견/정인"
          const sinsal = p.data[3]; // "역마살, ..."

          return (
            <PillarCol key={idx}>
              <ColHeader>{p.title}</ColHeader>
              <Cell>
                <Hanja char={ganji[0]}>{ganji[0]}</Hanja>
                <Sipseong>{sipseong[0]}</Sipseong>
              </Cell>
              <Cell>
                <Hanja char={ganji[1]}>{ganji[1]}</Hanja>
                <Sipseong>{sipseong[1]}</Sipseong>
              </Cell>
              <SinsalBox>
                {sinsal !== '-' && sinsal.split(',').map((s, i) => (
                  s.trim() && <SinsalTag key={i}>{s.trim()}</SinsalTag>
                ))}
              </SinsalBox>
            </PillarCol>
          );
        })}
      </SajuGrid>

      <SectionTitle>🌊 대운의 흐름 ({data.daeun.direction})</SectionTitle>
      <DaeunScroll>
        <DaeunTable>
          <tbody>
            <tr>
              {data.daeun.data.map((d, idx) => (
                <th key={idx}>
                  <DaeunAge>{d.나이}세</DaeunAge>
                  <Hanja char={d.간지[0]} style={{ fontSize: '32px' }}>{d.간지[0]}</Hanja>
                  <Hanja char={d.간지[1]} style={{ fontSize: '32px' }}>{d.간지[1]}</Hanja>
                  <br />
                  <span style={{ fontSize: '14px', color: '#666' }}>{d.십성}</span>
                </th>
              ))}
            </tr>
          </tbody>
        </DaeunTable>
      </DaeunScroll>

      <SectionTitle>📅 연도별/월별 운세 (클릭하여 상세보기)</SectionTitle>
      <SewunTable>
        <thead>
          <tr>
            <th width="20%">연도</th>
            <th width="20%">세운</th>
            <th width="30%">십성</th>
            <th width="30%">신살</th>
          </tr>
        </thead>
        <tbody>
          {data.sewun.data.map((year, idx) => (
            <React.Fragment key={idx}>
              <YearRow onClick={() => toggleYear(idx)} isOpen={expandedYear === idx}>
                <td>
                  <span style={{ fontWeight: '900', fontSize: '20px' }}>{year.연도}년</span>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    {expandedYear === idx ? <ChevronUp size={14} style={{ display: 'inline' }} /> : <ChevronDown size={14} style={{ display: 'inline' }} />}
                    {expandedYear === idx ? '접기' : '펼치기'}
                  </div>
                </td>
                <td>
                  <Hanja char={year.세운간지[0]} style={{ fontSize: '24px' }}>{year.세운간지[0]}</Hanja>
                  <Hanja char={year.세운간지[1]} style={{ fontSize: '24px' }}>{year.세운간지[1]}</Hanja>
                </td>
                <td>{year.세운십성}</td>
                <td>
                  {year.세운신살 !== '-' ? <Highlight>{year.세운신살}</Highlight> : '-'}
                </td>
              </YearRow>
              <AnimatePresence>
                {expandedYear === idx && (
                  <MonthRow
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <td colSpan="4" style={{ padding: '0' }}>
                      <div style={{ padding: '10px', background: '#fafafa' }}>
                        <MonthInnerTable>
                          <thead>
                            <tr>
                              <th>월</th>
                              <th>간지</th>
                              <th>십성</th>
                              <th>신살</th>
                            </tr>
                          </thead>
                          <tbody>
                            {year.월운.map((m, mIdx) => (
                              <tr key={mIdx}>
                                <td>{m.월}</td>
                                <td>
                                  <Hanja char={m.간지[0]} style={{ fontSize: '18px' }}>{m.간지[0]}</Hanja>
                                  <Hanja char={m.간지[1]} style={{ fontSize: '18px' }}>{m.간지[1]}</Hanja>
                                </td>
                                <td>{m.십성}</td>
                                <td style={{ color: m.신살 !== '-' ? '#d32f2f' : '#333' }}>{m.신살}</td>
                              </tr>
                            ))}
                          </tbody>
                        </MonthInnerTable>
                      </div>
                    </td>
                  </MonthRow>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </tbody>
      </SewunTable>

      <CtaContainer>
        <CtaTitle>이제 당신의 운명을 더 깊이 들여다볼 시간입니다</CtaTitle>
        <PremiumButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onConsultClick}
        >
          🔮 내 운명의 비밀 완전 해독하기
        </PremiumButton>
        <p style={{ marginTop: '15px', color: '#888', fontSize: '14px' }}>
          전문가의 1:1 맞춤 상담으로 숨겨진 운명을 밝혀드립니다
        </p>
      </CtaContainer>

    </ResultContainer>
  );
}
