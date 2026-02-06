
// Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://ojpicaadbflasknzvtmj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LpoSFzHRhfRT8p4c2svuAQ_pH_1bhwL';

// Supabase가 로드되었는지 확인
let supabase;
if (typeof createClient !== 'undefined') {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error('Supabase SDK가 로드되지 않았습니다.');
}

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
