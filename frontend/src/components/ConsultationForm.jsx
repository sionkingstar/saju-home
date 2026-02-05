import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { X, Check, Loader2 } from 'lucide-react';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(11, 16, 38, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  justify_content: center;
  align-items: center;
  padding: 20px;
  overflow-y: auto;
`;

const ModalContainer = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 600px;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  max-height: 90vh;
  overflow-y: auto;

  /* Scrollbar for modal content */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(212, 175, 55, 0.3);
    border-radius: 3px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.3s;
  &:hover { color: var(--color-accent); }
`;

const Title = styled.h2`
  font-family: 'Noto Serif KR', serif;
  color: var(--color-accent);
  font-size: 2rem;
  margin-bottom: 30px;
  text-align: center;
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: var(--color-text-secondary);
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
  }
`;

const Select = styled.select`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 1rem;
  appearance: none; /* Hide default arrow */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 1em;

  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  option {
    background: var(--color-bg-primary);
  }
`;

const TextArea = styled.textarea`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #D4AF37 0%, #AA8A2E 100%);
  border: none;
  border-radius: 8px;
  color: #0B1026;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Message = styled(motion.div)`
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  background: ${props => props.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'};
  border: 1px solid ${props => props.error ? '#ef4444' : '#22c55e'};
  color: ${props => props.error ? '#ef4444' : '#22c55e'};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

export default function ConsultationForm({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    gender: '여성', // Default
    birthDate: '',
    birthTime: '',
    calendarType: '양력',
    email: '',
    phone: '',
    worry: ''
  });

  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      alert("개인정보 수집 및 이용약관에 동의해주세요.");
      return;
    }
    setStatus('loading');
    setErrorMessage('');

    try {
      // Assuming the backend server is running on localhost:5000 based on standard setup. 
      // If frontend/backend are on different ports, proxy or full URL is needed. 
      // Using /api assumes proxy or same origin.
      const response = await axios.post('https://saju-home.onrender.com/api/submit', formData);

      if (response.status === 200) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          setStatus('idle');
          setFormData({ name: '', gender: '여성', birthDate: '', birthTime: '', calendarType: '양력', email: '', phone: '', worry: '' });
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.response?.data?.error || '신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContainer
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton onClick={onClose}><X size={24} /></CloseButton>

          <Title>사주 심층분석 신청</Title>

          {status === 'success' ? (
            <Message
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Check size={20} />
              신청이 완료되었습니다! 전문가가 곧 연락드리겠습니다.
            </Message>
          ) : (
            <form onSubmit={handleSubmit}>
              <FormGrid>
                <FormGroup>
                  <Label>이름</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="홍길동"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>성별</Label>
                  <Select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="여성">여성</option>
                    <option value="남성">남성</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>생년월일</Label>
                  <Input
                    type="text"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                    placeholder="19720101 (8자리 입력)"
                    maxLength={8}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>양력/음력</Label>
                  <Select name="calendarType" value={formData.calendarType} onChange={handleChange}>
                    <option value="양력">양력</option>
                    <option value="음력">음력</option>
                    <option value="윤달">윤달 (음력)</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>태어난 시간</Label>
                  <Input
                    type="text"
                    name="birthTime"
                    value={formData.birthTime}
                    onChange={handleChange}
                    placeholder="0830 (4자리 입력)"
                    maxLength={4}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>연락처</Label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="01012345678 (- 없이 입력)"
                    maxLength={11}
                  />
                </FormGroup>
              </FormGrid>

              <FormGroup style={{ marginBottom: '20px' }}>
                <Label>이메일</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="result@example.com (결과 발송용)"
                />
              </FormGroup>

              <FormGroup>
                <Label>고민 내용 및 문의사항</Label>
                <TextArea
                  name="worry"
                  value={formData.worry}
                  onChange={handleChange}
                  placeholder="현재 가장 큰 고민이나 상담받고 싶은 내용을 자유롭게 적어주세요."
                />
              </FormGroup>

              {status === 'error' && (
                <Message error>
                  {errorMessage}
                </Message>
              )}



              {/* 계좌 안내 박스 */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '15px',
                margin: '20px 0',
                textAlign: 'center'
              }}>
                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '5px' }}>상담 비용 (100% 환불 보장)</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>45,000원</p>
                <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }}></div>
                <p style={{ color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '1.1rem' }}>하나은행 895-910082-99207</p>
                <p style={{ color: 'white', marginTop: '5px' }}>예금주: 김주항</p>
              </div>

              {/* 개인정보 동의 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  height: '80px',
                  overflowY: 'auto',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '10px',
                  fontSize: '0.8rem',
                  color: '#888',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  border: '1px solid var(--glass-border)'
                }}>
                  [개인정보 수집 및 이용 동의]<br />
                  1. 수집 목적: 상담 서비스 제공 및 결과 발송<br />
                  2. 수집 항목: 이름, 생년월일, 연락처, 이메일<br />
                  3. 보유 기간: 서비스 목적 달성 시까지 (단, 관계 법령에 따름)<br />
                  4. 동의 거부 시 상담 접수가 불가능합니다.
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    required
                    style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px' }}
                  />
                  개인정보 수집 및 이용에 동의합니다 (필수)
                </label>
              </div>

              <SubmitButton
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? <Loader2 className="animate-spin" /> : '전문가 분석 신청하기 (입금 확인 후 진행)'}
              </SubmitButton>
            </form>
          )}
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
}
