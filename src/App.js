import React, { useEffect, useState } from 'react';
import KakaoLogin from 'react-kakao-login';
import {GoogleLogin} from '@react-oauth/google';
import {GoogleOAuthProvider} from '@react-oauth/google';
import './App.css';

function App() {

  let [글제목, 글제목변경] = useState(['State 사용하는 법', 'State를 사용하는 법2', 'State를 사용하는 법3']);
  let [날짜, 날짜변경] = useState(['2월 22일']);
  let [count, countChange] = useState(0);

  let posts = 'React 정보';
  let lineSetting = { borderWidth: '2px', borderColor: 'black', marginTop: '30px' };

  // ----------------------------------Kakao----------------------------------
  const [kakaodata, setKakaoData] = useState([]);
  const kakaoToken = 'f0761b5aef9f6f4fc0f8252320228d07';

  // 카카오 로그인 성공 시 실행되는 함수
  const kakaoOnSuccess = async (data)=>{
    console.log('카카오 로그인 성공:', data);
    const idToken = data.response.access_token; // 엑세스 토큰 가져오기

    // 토큰 백엔드 서버로 전달
    try {
      const res = await fetch('http://localhost:3001/api/kakao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: idToken }), // 토큰을 body에 담아 보냄 
      });

      const userData = await res.json();
      console.log('유저 데이터:', userData);

      // 받아온 유저 데이터를 상태에 저장
      setKakaoData(userData);
    } catch (error) {
      console.error('서버 통신 오류:', error);
    }
  };

  // 카카오 로그인 실패 시 실행되는 함수
  const kakaoOnFailure = (error) => {
    console.error('카카오 로그인 실패:', error)
  }
  // --------------------------------------------------------------------------
  // ----------------------------------Google----------------------------------
  const [googledata, setGoogleData] = useState([]);
  const clientId = '179922112081-o4p2sbdhc3u5g668c5nhmcf4ji1i2gml.apps.googleusercontent.com';

  const googleOnSuccess = async (data) => {
    console.log('구글 로그인 성공:', data);
    const credential = data.credential;
    
    try {
      // credential을 서버로 전달하여 사용자 정보 처리
      const res = await fetch('http://localhost:3001/api/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });
      
      const userData = await res.json();
      console.log('유저 데이터:', userData);

      // 받아온 유저 데이터를 상태에 저장
      setGoogleData(userData);
    } catch (error) {
      console.error('서버 통신 오류:', error);
    }
  };

  const googleOnFailure = (error) => {
    console.error('구글 로그인 실패:', error);
  };

  // --------------------------------------------------------------------------

  function ChangeName() {
    var newArray = [...글제목]
    newArray[1] = 'onClick을 사용하는 법'
    글제목변경(newArray)
  }

  return (
    <div className="App">
      <div className="black-nav">
        <div>개발 포트폴리오</div>
      </div>

      <div className="Login">
        <KakaoLogin 
          token = {kakaoToken}
          onSuccess={kakaoOnSuccess}
          onFail={kakaoOnFailure}
          render={({ onClick }) => (
            <button
              onClick={onClick}
              style={{
                backgroundColor: '#F7E600',
                color: '#3C1E1E',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '20px',
              }}
            >
              카카오 로그인
            </button>
          )}
        />

        <GoogleOAuthProvider clientId={clientId}>
          <div style={{
          display: 'flex',             // flexbox 사용
          justifyContent: 'center',    // 수평 가운데 정렬
          alignItems: 'center',        // 수직 가운데 정렬
          height: '10vh',              // 화면 전체 높이
          textAlign: 'center',         // 텍스트 가운데 정렬
          }}>
            <GoogleLogin 
              onSuccess={googleOnSuccess}
              onFailure={googleOnFailure}
            />
          </div>
        </GoogleOAuthProvider>
      </div>

      <div className='User'>
        {kakaodata.Nickname && (
          <div>
            <h3>환영합니다, {kakaodata.Nickname}님!</h3>
          </div>
        )}
        {googledata.Nickname && (
          <div>
            <h3>환영합니다, {googledata.Nickname}님!</h3>
          </div>
        )}
      </div>

      <Modal />
    </div>
  );
}

function Modal() {
  return (
    <div className='modal'>
      <h2>제목</h2>
        <p>날짜</p>
        <p>상세내용</p>
    </div>
  )
}

export default App;