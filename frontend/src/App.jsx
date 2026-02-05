import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Moon, Loader2 } from 'lucide-react';
import axios from 'axios';
import ConsultationForm from './components/ConsultationForm';
import SajuResult from './components/SajuResult';
import './App.css';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Changed from center to accommodate scrolling content */
  padding-top: 100px;
  position: relative;
  overflow-x: hidden;
  background: var(--color-bg-primary);
`;

/* Reuse BackgroundElements & GlowingOrb from previous step for consistency */
const BackgroundElements = styled.div`
  position: fixed; /* Fixed to stay during scroll */
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 0;
`;
const GlowingOrb = styled(motion.div)`
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4;
`;

const ContentWrapper = styled.div`
  z-index: 1;
  text-align: center;
  padding: 20px;
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled(motion.div)`
  font-family: 'Noto Serif KR', serif; font-size: 1.2rem;
  color: var(--color-accent); margin-bottom: 20px;
  display: flex; align-items: center; justify-content: center;gap: 10px;
  opacity: 0.8; letter-spacing: 2px;
`;

const MainTitle = styled(motion.h1)`
  font-family: 'Noto Serif KR', serif; font-size: 3.5rem; font-weight: 700;
  margin: 0 0 40px 0;
  background: linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #AA8A2E 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(212, 175, 55, 0.2);
  @media (max-width: 768px) { font-size: 2.2rem; }
`;

/* INPUT FORM STYLES */
const InputContainer = styled(motion.form)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  backdrop-filter: blur(10px);
  display: grid;
  gap: 15px;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const InputGroup = styled.div`
  display: flex; flex-direction: column; gap: 8px; text-align: left;
`;

const Label = styled.label`
  font-size: 0.9rem; color: var(--color-text-secondary); margin-left: 5px;
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 14px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
  &:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2); }
`;

const Select = styled.select`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 14px;
  color: white;
  font-size: 1rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat; background-position: right 10px center; background-size: 1em;
  option { background: var(--color-bg-primary); }
  &:focus { outline: none; border-color: var(--color-accent); }
`;

const AnalyzeButton = styled(motion.button)`
  background: linear-gradient(135deg, #D4AF37 0%, #AA8A2E 100%);
  border: none; border-radius: 12px; padding: 16px;
  color: #0B1026; font-size: 1.1rem; font-weight: bold; margin-top: 10px;
  cursor: pointer; width: 100%;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

/* --- 프로모션 버튼 영역 --- */
const InfoSection = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
`;

const InfoCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  padding: 15px 25px;
  border-radius: 15px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-secondary);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.1);
    border-color: var(--color-accent);
    color: var(--color-accent);
    transform: translateY(-2px);
  }
`;

function App() {
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    calendarType: 'solar', // solar, lunar
    isLeap: false,
    gender: 'M'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Convert YYYYMMDD or any format to YYYY-MM-DD for backend
    // Simple logic: if user enters 19900520, make it 1990-05-20. 
    // Ideally use a date picker, but text input was requested.
    // For now, assume user enters YYYY-MM-DD or handle simple formats in backend, 
    // but here we just pass it.

    try {
      const response = await axios.post('http://localhost:5000/api/analyze', {
        birth: formData.birthDate,
        gender: formData.gender,
        calendar: formData.calendarType,
        isLeap: formData.isLeap
      });
      setResult(response.data);
    } catch (error) {
      alert('분석 중 오류가 발생했습니다. 생년월일을 정확히(YYYY-MM-DD HH:MM) 입력했는지 확인해주세요.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <BackgroundElements>
        <GlowingOrb
          style={{ top: '-10%', left: '10%', width: '400px', height: '400px', background: '#1a223f' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity }}
        />
        <GlowingOrb
          style={{ bottom: '-10%', right: '10%', width: '500px', height: '500px', background: '#D4AF37', opacity: 0.1 }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 15, repeat: Infinity, delay: 2 }}
        />
      </BackgroundElements>

      <ContentWrapper>
        <Logo><Moon size={18} /> Celestial Destiny</Logo>
        <MainTitle
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
        >
          사주명가 대운
        </MainTitle>

        <InputContainer onSubmit={handleAnalyze} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <InputRow>
            <InputGroup>
              <Label>생년월일 (YYYY-MM-DD)</Label>
              <Input
                name="birthDate"
                placeholder="1995-05-20"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </InputGroup>
            <InputGroup>
              <Label>태어난 시간 (HH:MM)</Label>
              <Input
                name="birthTime"
                placeholder="14:30"
                value={formData.birthTime}
                onChange={(e) => {
                  // Merge time into birthDate format for backend if necessary, 
                  // or keep separate. Backend 'saju.py' expects 'YYYY-MM-DD HH:MM' in 'birth' field.
                  // We will combine them in handleAnalyze logic or just ask user to input full string?
                  // Let's ask user to input separate and combine them.
                  setFormData(prev => ({ ...prev, birthTime: e.target.value }));
                }}
              />
            </InputGroup>
          </InputRow>

          <InputRow>
            <InputGroup>
              <Label>양력/음력</Label>
              <Select name="calendarType" value={formData.calendarType} onChange={handleChange}>
                <option value="solar">양력</option>
                <option value="lunar">음력</option>
              </Select>
            </InputGroup>
            <InputGroup>
              <Label>성별</Label>
              <Select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="M">남성</option>
                <option value="F">여성</option>
              </Select>
            </InputGroup>
          </InputRow>

          {formData.calendarType === 'lunar' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }}>
              <Input
                type="checkbox"
                name="isLeap"
                checked={formData.isLeap}
                onChange={handleChange}
                style={{ width: 'auto' }}
              />
              윤달 여부
            </label>
          )}

          <AnalyzeButton type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : '✨ 무료 만세력 조회하기'}
          </AnalyzeButton>
        </InputContainer>

        {/* Display Result if available */}
        <SajuResult data={result} onConsultClick={() => setIsModalOpen(true)} />

      </ContentWrapper>

      <ConsultationForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Container>
  );
}

// Override handleAnalyze to combine date and time
const originalApp = App;
const InfoModalOverlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.7); z-index: 2000;
  display: flex; justify-content: center; align-items: center; padding: 20px;
  backdrop-filter: blur(5px);
`;

const InfoModalContent = styled(motion.div)`
  background: linear-gradient(135deg, #1a223f 0%, #0B1026 100%);
  border: 1px solid var(--color-accent);
  padding: 30px; border-radius: 20px; max-width: 500px; width: 100%;
  text-align: center; color: white; position: relative;
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.2);
`;

function AppWithLogic() {
  const [formData, setFormData] = useState({
    birthDate: '', // Just date part
    birthTime: '', // Just time part
    calendarType: 'solar',
    isLeap: false,
    gender: 'M'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState(null); // { title: '', content: '' }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Parse Date: allow YYYYMMDD or YYYY-MM-DD
    let dateStr = formData.birthDate.replace(/[^0-9]/g, ''); // User wants just numbers usually
    if (dateStr.length === 8) {
      // 19771006 -> 1977-10-06
      dateStr = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    } else if (formData.birthDate.includes('-')) {
      dateStr = formData.birthDate; // Keep existing if valid
    } else {
      alert('생년월일은 8자리 숫자로 입력해주세요 (예: 19771006)');
      setLoading(false);
      return;
    }

    // Parse Time: allow HHMM or HH:MM
    let timeStr = formData.birthTime ? formData.birthTime.replace(/[^0-9]/g, '') : "0000";
    if (timeStr.length === 4) {
      // 0830 -> 08:30
      timeStr = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
    } else if (timeStr.length === 0) {
      timeStr = "00:00";
    }

    const fullBirthStr = `${dateStr} ${timeStr}`;

    try {
      const response = await axios.post('http://localhost:5000/api/analyze', {
        birth: fullBirthStr,
        gender: formData.gender,
        calendar: formData.calendarType,
        isLeap: formData.isLeap
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || '분석 중 오류가 발생했습니다. (잠시 후 다시 시도해주세요)';
      alert(`오류: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <BackgroundElements>
        <GlowingOrb
          style={{ top: '-10%', left: '10%', width: '400px', height: '400px', background: '#1a223f' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity }}
        />
        <GlowingOrb
          style={{ bottom: '-10%', right: '10%', width: '500px', height: '500px', background: '#D4AF37', opacity: 0.1 }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 15, repeat: Infinity, delay: 2 }}
        />
      </BackgroundElements>

      <ContentWrapper>
        <Logo><Moon size={18} /> Celestial Destiny</Logo>
        <MainTitle initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          사주명가 대운
        </MainTitle>

        <InfoSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <InfoCard onClick={() => setModalInfo({
            title: "👨‍🏫 전문가 소개",
            content: "✔ 25년 교육계 경력\n✔ 상담심리사 / 임상심리사 1급\n✔ 명리심리상담사 1급\n\n'당신의 고민을 깊이 듣고 현명한 선택을 돕는 이정표가 되어드립니다.'"
          })}>
            <span>👨‍🏫 전문가 소개</span>
          </InfoCard>
          <InfoCard onClick={() => setModalInfo({
            title: "📜 상담 진행 안내",
            content: "1. 신청서 작성 (생년월일/고민)\n2. 입금 확인 (하나은행 45,000원)\n3. 정밀 분석 시작\n4. 24시간 내 이메일 결과 발송"
          })}>
            <span>📜 상담 절차</span>
          </InfoCard>
          <InfoCard onClick={() => setModalInfo({
            title: "🛡️ 100% 환불 보장",
            content: "상담 결과에 만족하지 못하신다면\n묻지도 따지지도 않고\n100% 전액 환불해 드립니다."
          })}>
            <span>🛡️ 환불 보장</span>
          </InfoCard>
        </InfoSection>

        {modalInfo && (
          <AnimatePresence>
            <InfoModalOverlay onClick={() => setModalInfo(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InfoModalContent onClick={e => e.stopPropagation()} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <h2 style={{ color: 'var(--color-accent)', marginBottom: '20px', fontFamily: 'Noto Serif KR, serif' }}>{modalInfo.title}</h2>
                <p style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontSize: '1.1rem' }}>{modalInfo.content}</p>
                <button
                  onClick={() => setModalInfo(null)}
                  style={{ marginTop: '30px', padding: '10px 30px', background: 'var(--color-accent)', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', color: '#0B1026' }}
                >
                  닫기
                </button>
              </InfoModalContent>
            </InfoModalOverlay>
          </AnimatePresence>
        )}

        <InputContainer onSubmit={handleAnalyze} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <InputRow>
            <InputGroup>
              <Label>생년월일 (예: 19720101)</Label>
              <Input
                name="birthDate"
                placeholder="19720101"
                value={formData.birthDate}
                onChange={handleChange}
                maxLength={10}
                required
              />
            </InputGroup>
            <InputGroup>
              <Label>태어난 시간 (예: 0830)</Label>
              <Input
                name="birthTime"
                placeholder="0830"
                value={formData.birthTime}
                onChange={handleChange}
                maxLength={5}
              />
            </InputGroup>
          </InputRow>

          <InputRow>
            <InputGroup>
              <Label>양력/음력</Label>
              <Select name="calendarType" value={formData.calendarType} onChange={handleChange}>
                <option value="solar">양력</option>
                <option value="lunar">음력</option>
              </Select>
            </InputGroup>
            <InputGroup>
              <Label>성별</Label>
              <Select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="M">남성</option>
                <option value="F">여성</option>
              </Select>
            </InputGroup>
          </InputRow>

          {formData.calendarType === 'lunar' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-secondary)', fontSize: '0.9rem', cursor: 'pointer', paddingLeft: '5px' }}>
              <Input
                type="checkbox"
                name="isLeap"
                checked={formData.isLeap}
                onChange={handleChange}
                style={{ width: '16px', height: '16px' }}
              />
              윤달 여부
            </label>
          )}

          <AnalyzeButton type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : '✨ 무료 만세력 조회하기'}
          </AnalyzeButton>
        </InputContainer>

        <SajuResult data={result} onConsultClick={() => setIsModalOpen(true)} />

      </ContentWrapper>

      <ConsultationForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Container>
  );
}

export default AppWithLogic;
