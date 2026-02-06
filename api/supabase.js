
// Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://ojpicaadbflasknzvtmj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LpoSFzHRhfRT8p4c2svuAQ_pH_1bhwL';

// Supabase가 로드되었는지 확인 및 클라이언트 초기화
// CDN 방식에서는 'supabase' 전역 객체 안에 'createClient'가 있습니다.
if (window.supabase && window.supabase.createClient) {
    // 전역 supabase 객체를 클라이언트 인스턴스로 교체 (다른 파일 호환성 유지)
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase initialized');
} else if (typeof createClient !== 'undefined') {
    // 일부 환경(모듈 등)에서 createClient가 전역일 경우 대비
    window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error('Supabase SDK가 로드되지 않았습니다.');
}
// 전역 변수 scope 확보를 위한 안전장치 (이미 window.supabase에 할당했지만 명시적으로)
const supabase = window.supabase;

// 회원가입 함수
async function signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: name,
            },
        },
    });
    return { data, error };
}

// 로그인 함수
async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });
    return { data, error };
}

// 로그아웃 함수
async function signOut() {
    const { error } = await supabase.auth.signOut();
    return error;
}

// 현재 로그인한 사용자 가져오기
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}
