
// Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://ojpicaadbflasknzvtmj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LpoSFzHRhfRT8p4c2svuAQ_pH_1bhwL';

// Supabase가 로드되었는지 확인 및 클라이언트 초기화
// CDN 방식: window.supabase (라이브러리) -> window.supabase (클라이언트 인스턴스)로 교체

if (window.supabase && typeof window.supabase.from === 'function') {
    // 이미 초기화된 경우 (클라이언트 인스턴스임)
    console.log('Supabase already initialized');
} else if (window.supabase && window.supabase.createClient) {
    // 라이브러리가 로드된 상태. 클라이언트 초기화 후 덮어씌우기
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase initialized successfully');
} else {
    // 로드 실패 또는 순서 문제
    console.error('Major Error: Supabase SDK not found. Make sure the CDN script tag is placed BEFORE this script.');
}

// 이후 코드에서 'supabase'를 참조하면 window.supabase를 사용하게 됩니다.

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
// 현재 로그인한 사용자 가져오기
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// 내 예약 목록 가져오기 (객실 정보 포함)
async function getUserBookings(userId) {
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            rooms (
                name,
                image_url
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { data, error };
}

// 예약 취소하기
async function cancelBooking(bookingId) {
    const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
    return { data, error };
}
