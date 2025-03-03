const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const axios = require('axios');
const {OAuth2Client} = require('google-auth-library');

const app = express();
const port = 3001;

// CORS 설정 (모든 출처에서의 요청을 허용)
app.use(cors());
app.use(express.json()); // JSON 형식의 요청 본문 처리

// 특정 출처만 허용하는 방법
//app.use(cors({
//    origin: 'http://localhost:3001'  // React 앱이 실행되는 주소를 지정
//}));

// MySQL 연결
const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'dkqmfkzkxkqmfk0!',
    database : 'testsql'
})

db.connect((err) => {
    if (err) {
        console.error('MySQL 연결 실패 : ', err);
        return;
    }
    console.log('MySQL 연결 성공');
})

// 구글 OAuth2 클라이언트 설정
const googleClient = new OAuth2Client('179922112081-o4p2sbdhc3u5g668c5nhmcf4ji1i2gml.apps.googleusercontent.com');

// 구글 로그인 처리 APT
app.post('/api/google-login', async (req, res) => {
    const { credential } = req.body; // 클라이언트에서 전달된 credential

    try {
        // 구글 사용자 인증
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: '179922112081-o4p2sbdhc3u5g668c5nhmcf4ji1i2gml.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();    // 사용자 정보
        const googleId = payload.sub;           // 구글 사용자 ID
        const nickname = payload.name;          // 사용자명

        // MySQL에서 해당 사용자 확인
        db.query('SELECT * FROM googledata WHERE googleId = ?', [googleId], (err, results) => {
            if (err) {
                return res.status(500).json({ error: '데이터베이스 오류' });
            }

            if (results.length > 0) {
                // 이미 존재하는 사용자 반환
                return res.json(results[0]);
            } else {
                // 새로운 사용자 저장
                const query = 'INSERT INTO googledata (googleId, nickname) VALUES (?, ?)';
                db.query(query, [googleId, nickname], (insertErr) => {
                    if (insertErr) {
                        return res.status(500).json({error: '데이터베이스 삽입 오류'});
                    }
                    // 새로운 사용자 반환
                    return res.json({ nickname });
                });
            }
        });
    } catch (error) {
        console.error('구글 인증 오류:', error);
        return res.status(500).json({ error: '구글 인증 실패' });
    }
});

// 카카오 로그인 후 유저 정보 저장 또는 조회
app.post('/api/kakao', (req, res) => {
    const { access_token } = req.body; // 클라이언트에서 전달된된 토큰

    // 카카오 API에서 유저 정보 가져오기
    axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    })
    .then((response) => {
        const id = response.data.id;
        const nickname = response.data.properties.nickname;

        // MySQL에서 해당 유저가 이미 존재하는 지 확인
        db.query('SELECT * FROM kakaodata WHERE kakaoid = ?', [id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: '데이터베이스 조회 오류'});
            }

            if (results.length > 0) {
                // 해당 유저가 이미 존재하면 해당 유저의 데이터 반환
                return res.json(results[0]);
            } else {
                // 유저가 존재하지 않으면 새로운 유저로 변경
                const query = 'INSERT INTO kakaodata (kakaoid, nickname) VALUES (?, ?)';
                db.query(query, [id, nickname], (insertErr) => {
                    if (insertErr) {
                        return res.status(500).json({ error: '데이터베이스 삽입 오류' });
                    }

                    // 새로 저장된 유저 데이터를 반환
                    return res.json({ kakaoid: id, nickname });
                });
            }
        });
    })
    .catch((error) => {
        console.error('카카오 API 오류:', error.response || error);
        return res.status(500).json({ error: '카카오 API 요청 실패' });
    });
});

app.listen(port, () => {
    console.log('서버가 http://localhost:', port, '에서 실행 중');
})