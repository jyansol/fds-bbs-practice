import '@babel/polyfill';

import axios from 'axios';

const api = axios.create({
  //바깥에서 주입해준 환경변수를 사용하는 코드
  //이 컴퓨터에서만 사용할 환경변수를 설정하기 우해새 .env 파일을 편집
  //.env 파일에는 개발용 서버 주소를 넣어줌 => 서버를 껐다켜야함
  baseURL: process.env.API_URL,
});

api.interceptors.request.use(function(config) {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
});

const templates = {
  loginForm: document.querySelector('#login-form').content,
  postList: document.querySelector('#post-list').content,
  postItem: document.querySelector('#post-item').content,
  postForm: document.querySelector('#post-form').content,
  postDetail: document.querySelector('#post-detail').content,
  commentItem: document.querySelector('#comment-item').content,
};

const rootEl = document.querySelector('.root');

// 페이지 그리는 함수 작성 순서
// 1. 템플릿 복사
// 2. 요소 선택
// 3. 필요한 데이터 불러오기
// 4. 내용 채우기
// 5. 이벤트 리스너 등록하기
// 6. 템플릿을 문서에 삽입

async function drawLoginForm() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.loginForm, true);

  // 2. 요소 선택
  const formEl = frag.querySelector('.login-form');

  // 3. 필요한 데이터 불러오기 - 필요없음
  // 4. 내용 채우기 - 필요없음
  // 5. 이벤트 리스너 등록하기
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;

    const res = await api.post('/users/login', {
      username,
      password,
    });

    localStorage.setItem('token', res.data.token);
    drawPostList();
  });

  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = '';
  rootEl.appendChild(frag);
}

async function drawPostList() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.postList, true);

  // 2. 요소 선택
  const listEl = frag.querySelector('.post-list');
  // 3. 필요한 데이터 불러오기
  // 분해대입, data라는 속성을 꺼내와서 미리 대입해 줄 수 있음
  //data라는 속성값을 불러와서 postList를 저장; const postList = res.data
  const { data: postList } = await api.get('/posts?_expand=user');
  // 4. 내용 채우기
  for (const postItem of postList) {
    const frag = document.importNode(templates.postItem, true);
    const idEl = frag.querySelector('.id');
    const titleEl = frag.querySelector('.title');
    const authorEl = frag.querySelector('.author');

    idEl.textContent = postItem.id;
    titleEl.textContent = postItem.title;
    authorEl.textContent = postItem.user.username;

    listEl.appendChild(frag);

    titleEl.addEventListener('click', (e) => {
      console.log(postItem.id);
      //클릭한 놈의 아이디
      drawPostDetail(postItem.id);
    });
  }
  // 5. 이벤트 리스너 등록하기

  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = '';
  rootEl.appendChild(frag);
}

//게시물을 그리는 함수
//postId를 매개변수로 받고 있음 -> 어떤 게시물을 그릴지 알려줘야하니까
async function drawPostDetail(postId) {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.postDetail, true);
  // 2. 요소 선택
  const titleEl = frag.querySelector('.title');
  const authorEl = frag.querySelector('.author');
  const bodyEl = frag.querySelector('.body');
  const backEl = frag.querySelector('.back');

  // 3. 필요한 데이터 불러오기
  // data title,body
  // , {params}
  const {
    data: { title, body, user },
  } = await api.get('/posts/' + postId, {
    params: {
      _expand: 'user',
    },
  });
  // 4. 내용 채우기
  titleEl.textContent = title;
  bodyEl.textContent = body;
  authorEl.textContent = user.username;
  // 5. 이벤트 리스너 등록하기
  backEl.addEventListener('click', (e) => {
    // 목록을 다시 그려주는 페이지를 출력해야하니까
    drawPostList();
  });
  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = '';
  //초기화하지않으면 추가해주는 모든게 다 보임
  rootEl.appendChild(frag);
}

async function drawNewPostForm() {
  // 1. 템플릿 복사
  // 2. 요소 선택
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
}

async function drawEditPostForm(postId) {
  // 1. 템플릿 복사
  // 2. 요소 선택
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
}

// 페이지 로드 시 그릴 화면 설정
if (localStorage.getItem('token')) {
  drawPostList();
} else {
  drawLoginForm();
}
