from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import saju
import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID")

# 메인 접속 시 index.html 보여주기
@app.route('/')
def home():
    return render_template('index.html')

# 사주 계산 요청 처리
@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        birth = data.get('birth')
        gender = data.get('gender')
        calendar_type = data.get('calendar', 'solar')
        is_leap = data.get('isLeap', False)

        # 저장 기능 삭제됨 -> 바로 계산만 수행
        result_json_str = saju.analyze_saju_full(birth, gender, calendar_type, is_leap)
        
        # 결과를 JSON으로 돌려줌
        return jsonify(json.loads(result_json_str))
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error in analyze: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/submit', methods=['POST'])
def submit_consultation():
    try:
        data = request.json
        
        headers = {
            "Authorization": f"Bearer {NOTION_API_KEY}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        
        payload = {
            "parent": {"database_id": NOTION_DATABASE_ID},
            "properties": {
                "이름": {
                    "title": [{"text": {"content": data.get("name", "")}}]
                },
                "성별": {
                    "select": {"name": data.get("gender", "")}
                },
                "생년월일": {
                    "rich_text": [{"text": {"content": data.get("birthDate", "")}}]
                },
                "태어난 시간": {
                    "rich_text": [{"text": {"content": data.get("birthTime", "모름")}}]
                },
                "양력/음력/윤달": {
                    "select": {"name": data.get("calendarType", "양력")}
                },
                "이메일": {
                    "email": data.get("email", "")
                },
                "전화번호": {
                    "phone_number": data.get("phone", "")
                },
                "고민 내용 및 문의사항": {
                    "rich_text": [{"text": {"content": data.get("worry", "")}}]
                }
            }
        }
        
        response = requests.post("https://api.notion.com/v1/pages", headers=headers, json=payload)
        
        if response.status_code != 200:
            return jsonify({"error": f"Notion API Error: {response.text}"}), response.status_code
            
        # 메일 발송 로직 추가
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.header import Header

            sender = os.getenv("EMAIL_SENDER")
            password = os.getenv("EMAIL_PASSWORD")
            receiver = os.getenv("EMAIL_RECEIVER")

            if sender and password and receiver and "your_email" not in sender:
                title = f"[사주명가] 새로운 신청이 들어왔습니다! ({data.get('name', '고객')})"
                content = f"""
                [새로운 사주 심층분석 신청]
                
                이름: {data.get('name')}
                성별: {data.get('gender')}
                생년월일: {data.get('birthDate')} {data.get('birthTime')}
                연락처: {data.get('phone')}
                이메일: {data.get('email')}
                
                고민내용:
                {data.get('worry')}
                """
                
                msg = MIMEText(content, 'plain', 'utf-8')
                msg['Subject'] = Header(title, 'utf-8')
                msg['From'] = sender
                msg['To'] = receiver

                # Gmail SMTP 서버 이용 (SSL)
                with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
                    smtp.login(sender, password)
                    smtp.send_message(msg)
                print("Email notification sent successfully.")
            else:
                print("Email config missing. Skipping notification.")

        except Exception as mail_err:
            print(f"Failed to send email: {mail_err}")
            # 이메일 실패해도 고객에게는 성공 응답 보냄

        return jsonify({"message": "Successfully submitted to Notion"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
        