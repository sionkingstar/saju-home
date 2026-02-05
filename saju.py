import json
from skyfield.api import load
from skyfield.framelib import ecliptic_frame
from skyfield.searchlib import find_discrete
from pytz import timezone
from datetime import datetime
from korean_lunar_calendar import KoreanLunarCalendar

# --- [0. 사용자 설정 (자동화)] ---
# 항상 '올해'부터 10년치를 뽑도록 설정
CURRENT_YEAR = datetime.now().year 
DURATION = 10     

# --- [1. 기초 데이터] ---
ts = load.timescale()
planets = load('de421.bsp')
sun = planets['sun']
earth = planets['earth']

CHEONGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
JIJI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

ELEMENTS = {
    '甲': {'오행': '木', '음양': 0}, '乙': {'오행': '木', '음양': 1},
    '丙': {'오행': '火', '음양': 0}, '丁': {'오행': '火', '음양': 1},
    '戊': {'오행': '土', '음양': 0}, '己': {'오행': '土', '음양': 1},
    '庚': {'오행': '金', '음양': 0}, '辛': {'오행': '金', '음양': 1},
    '壬': {'오행': '水', '음양': 0}, '癸': {'오행': '水', '음양': 1},
    '子': {'오행': '水', '음양': 1}, '丑': {'오행': '土', '음양': 1},
    '寅': {'오행': '木', '음양': 0}, '卯': {'오행': '木', '음양': 1},
    '辰': {'오행': '土', '음양': 0}, '巳': {'오행': '火', '음양': 1},
    '午': {'오행': '火', '음양': 0}, '未': {'오행': '土', '음양': 1},
    '申': {'오행': '金', '음양': 0}, '酉': {'오행': '金', '음양': 1},
    '戌': {'오행': '土', '음양': 0}, '亥': {'오행': '水', '음양': 0}
}
OHENG_IDX = {'木': 0, '火': 1, '土': 2, '金': 3, '水': 4}
RELATION_MAP = {
    0: ['비견', '겁재'], 1: ['식신', '상관'], 2: ['편재', '정재'],
    3: ['편관', '정관'], 4: ['편인', '정인']
}
SOLAR_TERMS_MAP = {'입춘': '寅', '경칩': '卯', '청명': '辰', '입하': '巳', '망종': '午', '소서': '未', '입추': '申', '백로': '酉', '한로': '戌', '입동': '亥', '대설': '子', '소한': '丑'}
MONTH_ORDER = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']

# --- [신살 데이터] ---
CHUNG_MAP = {'子': '午', '丑': '未', '寅': '申', '卯': '酉', '辰': '戌', '巳': '亥', 
             '午': '子', '未': '丑', '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳'}
SAMHAP_MAP = {
    '申': '水국(신자진)', '子': '水국(신자진)', '辰': '水국(신자진)',
    '亥': '木국(해묘미)', '卯': '木국(해묘미)', '未': '木국(해묘미)',
    '寅': '火국(인오술)', '午': '火국(인오술)', '戌': '火국(인오술)',
    '巳': '金국(사유축)', '酉': '金국(사유축)', '丑': '金국(사유축)'
}

def solar_term_function(t):
    e = earth.at(t)
    _, lon, _ = e.observe(sun).apparent().frame_latlon(ecliptic_frame)
    return (lon.degrees // 15).astype(int)
solar_term_function.step_days = 0.5

def get_term_dict(year):
    t0 = ts.utc(year - 1, 12, 1)
    t1 = ts.utc(year, 12, 31)
    times, events = find_discrete(t0, t1, solar_term_function)
    kst = timezone('Asia/Seoul')
    term_names = ['춘분','청명','곡우','입하','소만','망종','하지','소서','대서','입추','처서','백로','추분','한로','상강','입동','소설','대설','동지','소한','대한','입춘','우수','경칩']
    term_list = []
    for t, e in zip(times, events):
        term_list.append((term_names[e], t.astimezone(kst)))
    term_list.sort(key=lambda x: x[1], reverse=True)
    return term_list

def get_sip_seong(day_stem, target_char):
    if not target_char or target_char not in ELEMENTS: return ""
    me = ELEMENTS[day_stem]
    you = ELEMENTS[target_char]
    my_idx = OHENG_IDX[me['오행']]
    your_idx = OHENG_IDX[you['오행']]
    diff = (your_idx - my_idx) % 5
    is_diff = 0 if me['음양'] == you['음양'] else 1
    return RELATION_MAP[diff][is_diff]

def get_ganji_index(ganji):
    for i in range(60):
        if CHEONGAN[i % 10] == ganji[0] and JIJI[i % 12] == ganji[1]: return i
    return 0

def analyze_relation(day_branch, target_branch):
    result = []
    if CHUNG_MAP.get(day_branch) == target_branch: result.append("충(沖)")
    my_group = SAMHAP_MAP.get(day_branch, '')
    target_group = SAMHAP_MAP.get(target_branch, '')
    if my_group and my_group == target_group: result.append(f"합({my_group[:2]})")
    if day_branch in ['申', '子', '辰']:
        if target_branch == '寅': result.append("역마살")
        elif target_branch == '酉': result.append("도화살")
        elif target_branch == '辰': result.append("화개살")
    return ", ".join(result) if result else "-"

def get_daeun_list(year_stem, month_pillar, gender, day_stem, day_branch, birth_dt, term_list):
    year_stem_idx = CHEONGAN.index(year_stem)
    is_yang_year = (year_stem_idx % 2 == 0)
    is_forward = True
    if gender == 'M':
        if not is_yang_year: is_forward = False
    else: 
        if is_yang_year: is_forward = False 
    
    direction_str = "순행" if is_forward else "역행"

    dates = [t[1] for t in term_list]
    dates.sort()
    
    prev_term_date = None
    next_term_date = None
    
    for d in dates:
        if d > birth_dt:
            next_term_date = d
            break
        prev_term_date = d
            
    diff_days = 0
    if is_forward:
        if next_term_date: diff_days = (next_term_date - birth_dt).days
        else: diff_days = 30 
    else:
        if prev_term_date: diff_days = (birth_dt - prev_term_date).days
        else: diff_days = 30
            
    daeun_num = round(diff_days / 3)
    if daeun_num < 1: daeun_num = 1
    
    start_idx = get_ganji_index(month_pillar)
    daeun_data = []
    birth_year = birth_dt.year
    
    for i in range(1, 11): 
        idx = (start_idx + i) % 60 if is_forward else (start_idx - i) % 60
        ganji = CHEONGAN[idx % 10] + JIJI[idx % 12]
        rel = analyze_relation(day_branch, ganji[1])
        age = daeun_num + (i - 1) * 10
        start_year = birth_year + age - 1
        
        daeun_data.append({
            "나이": age, "연도": start_year, "간지": ganji, 
            "십성": f"{get_sip_seong(day_stem, ganji[0])}/{get_sip_seong(day_stem, ganji[1])}", 
            "신살": rel
        })
        
    return direction_str, daeun_data

def get_future_luck(start_year, duration, day_stem, day_branch):
    future_data = []
    for i in range(duration):
        target_year = start_year + i
        year_idx = (target_year - 4) % 60
        year_stem = CHEONGAN[year_idx % 10]
        year_branch = JIJI[year_idx % 12]
        y_rel = analyze_relation(day_branch, year_branch)
        month_list = []
        for m_idx, branch in enumerate(MONTH_ORDER):
            stem_idx = CHEONGAN.index(year_stem)
            month_stem_idx = ((stem_idx % 5) * 2 + m_idx + 2) % 10
            month_stem = CHEONGAN[month_stem_idx]
            m_rel = analyze_relation(day_branch, branch)
            month_list.append({
                "월": f"{m_idx+1}월", "간지": month_stem + branch,
                "십성": f"{get_sip_seong(day_stem, month_stem)}/{get_sip_seong(day_stem, branch)}",
                "신살": m_rel
            })
        future_data.append({
            "연도": target_year, "세운간지": year_stem + year_branch,
            "세운십성": f"{get_sip_seong(day_stem, year_stem)}/{get_sip_seong(day_stem, year_branch)}",
            "세운신살": y_rel, "월운": month_list
        })
    return future_data

def analyze_saju_full(birth_str, gender, calendar_type='solar', is_leap=False):
    kst = timezone('Asia/Seoul')
    dt_temp = datetime.strptime(birth_str, "%Y-%m-%d %H:%M")
    
    final_birth_dt = None
    converted_info = ""

    if calendar_type == 'lunar':
        calendar = KoreanLunarCalendar()
        calendar.setLunarDate(dt_temp.year, dt_temp.month, dt_temp.day, is_leap)
        solar_date_str = calendar.getSolarIsoFormat() 
        final_birth_str = f"{solar_date_str} {dt_temp.hour}:{dt_temp.minute}"
        final_birth_dt = kst.localize(datetime.strptime(final_birth_str, "%Y-%m-%d %H:%M"))
        leap_str = " (윤달)" if is_leap else ""
        converted_info = f"음력 {birth_str[:10]}{leap_str} -> 양력 {solar_date_str}"
    else:
        final_birth_dt = kst.localize(dt_temp)
        converted_info = "양력 (변환 없음)"

    year = final_birth_dt.year
    terms = get_term_dict(year)

    # (A) 사주팔자
    found_term_name, month_branch = None, "모름"
    for name, dt in terms:
        if final_birth_dt >= dt:
            if name in SOLAR_TERMS_MAP:
                found_term_name, month_branch = name, SOLAR_TERMS_MAP[name]; break
            elif name == '소한': found_term_name, month_branch = name, '丑'; break
    if not found_term_name: month_branch, found_term_name = '子', '대설(전년)'

    ipchun = next((dt for n, dt in terms if n == '입춘'), None)
    saju_year = year - 1 if ipchun and final_birth_dt < ipchun else year
    year_stem = CHEONGAN[(saju_year - 4) % 10]
    year_branch = JIJI[(saju_year - 4) % 12]

    month_stem = CHEONGAN[((CHEONGAN.index(year_stem) % 5) * 2 + MONTH_ORDER.index(month_branch) + 2) % 10]
    
    d1, d2 = datetime(final_birth_dt.year, final_birth_dt.month, final_birth_dt.day), datetime(1900, 1, 1)
    day_idx = (10 + (d1 - d2).days) % 60
    day_stem, day_branch = CHEONGAN[day_idx % 10], JIJI[day_idx % 12]

    adj_min = (final_birth_dt.hour * 60 + final_birth_dt.minute) - 30
    hour_branch_idx = 0 if adj_min < 0 else ((adj_min // 60) + 1) // 2 % 12
    hour_branch = JIJI[hour_branch_idx]
    hour_stem = CHEONGAN[((CHEONGAN.index(day_stem) % 5) * 2 + hour_branch_idx) % 10]

    # (B) 대운
    direction, daeun_list = get_daeun_list(year_stem, month_stem + month_branch, gender, day_stem, day_branch, final_birth_dt, terms)
    
    # [변경] 현재 연도부터 10년치
    future_luck = get_future_luck(CURRENT_YEAR, DURATION, day_stem, day_branch)
    
    shinsal_pillar = {
        "년주": analyze_relation(day_branch, year_branch),
        "월주": analyze_relation(day_branch, month_branch),
        "일주": "-", "시주": analyze_relation(day_branch, hour_branch)
    }

    final_json = {
        "user_info": {
            "입력정보": f"{birth_str} ({'여성' if gender=='F' else '남성'})",
            "변환정보": converted_info,
            "성별": "여성" if gender == 'F' else "남성",
            "일간(본인)": f"{day_stem}({ELEMENTS[day_stem]['오행']})",
            "대운방향": direction
        },
        "pillar": {
            "tab_name": "사주팔자",
            "data": [
                ["시주", hour_stem+hour_branch, f"{get_sip_seong(day_stem, hour_stem)}/{get_sip_seong(day_stem, hour_branch)}", shinsal_pillar['시주']],
                ["일주", day_stem+day_branch, "일간/비견", "-"],
                ["월주", month_stem+month_branch, f"{get_sip_seong(day_stem, month_stem)}/{get_sip_seong(day_stem, month_branch)}", shinsal_pillar['월주']],
                ["년주", year_stem+year_branch, f"{get_sip_seong(day_stem, year_stem)}/{get_sip_seong(day_stem, year_branch)}", shinsal_pillar['년주']]
            ]
        },
        "daeun": { "tab_name": "대운", "direction": direction, "data": daeun_list },
        "sewun": { "tab_name": "세운/월운", "data": future_luck }
    }
    
    return json.dumps(final_json, indent=2, ensure_ascii=False)