       (function(){
            const STORAGE_KEY = "memo-data";
            const TAGS = ['Daily', 'Work','Others'];

            /*-----상태-----*/
            let memos=load();
            let activeTag=null;
            let searchingTerm='';
            let selectedMemoId = null;

            function load(){
                const mem = localStorage.getItem(STORAGE_KEY)
                if(mem) return JSON.parse(mem);
                
                return [
                    memo('회의 준비', 'CEOS의 늪에 빠져버렸습니다.', 'Work', true),
                    memo('도망가자', '살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요살려주세요.', 'Daily', false),
                    memo('아이디어 메모', '주말 여행 코스 후보 3개 정리해두기.', 'Others', false),
                    memo('책 읽기', '이번 주까지 읽던 책 100페이지 마저 읽기.', 'Daily', false),
                    memo('도망가자', '살려주세요.', 'Daily', false),
                    memo('도망가자', '살려주세요.', 'Daily', false)
                ]
            }

            function memo(title, lead, tag, favorite)
            {
                return{
                    id: Date.now() + Math.random(),
                    title,
                    lead,
                    tag,
                    favorite:!!favorite,
                    date:new Date()
                }
            }
            function formatDate(date){
                const d = date instanceof Date ? date : new Date(date);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${yyyy}.${mm}.${dd}`; // 예: 2026.09.08
            }
            /*------------DOM 참조------------*/
            const memoGrid = document.getElementById('memoGrid');
            const emptyGrid = document.getElementById('emptyGrid');
            const searchInput = document.getElementById('searchInput');
            const searchPicker = document.getElementById('searchPicker');
            const searchPickerBtn = document.getElementById('searchPickerBtn');
            const searchPickerLabel = document.getElementById('searchPickerLabel');
            const searchEmpty = document.getElementById('searchEmpty');
            const tagMenu = document.getElementById('tagMenu');
            const popupClose = document.getElementById('popupClose');
            const modal = document.getElementById('modal');
            const result = document.getElementById('result');
            const modalContents = document.getElementById('modalContents');
            
            /* ----------- 서치 태그메뉴 -----------*/
            function buildTagMenu(){
                const all = ['전체', ...TAGS];
                tagMenu.innerHTML = all.map(t => {
                const val = t === '전체' ? '' : t;
                const isActive = (activeTag || '') === val;
                return `<button type="button" data-tag="${val}" class="${isActive?'active':''}">${t}</button>`;
                }).join('');
            }
            tagMenu.addEventListener('click', (e)=>{
                const btn = e.target.closest('button[data-tag]');
                if(!btn) return;
                activeTag = btn.dataset.tag || null;
                searchPickerLabel.textContent = activeTag || '태그 선택';
                searchPicker.classList.remove('open');
                buildTagMenu();
                render();
            });
            searchPickerBtn.addEventListener('click', (e)=>{
                e.stopPropagation(); // 아래 document 클릭 리스너와 충돌 방지
                searchPicker.classList.toggle('open');
            });

            document.addEventListener('click', (e)=>{
                if(!searchPicker.contains(e.target)){
                    searchPicker.classList.remove('open');
                }
            });
            searchInput.addEventListener('input', (e)=> {
                searchingTerm = e.target.value.trim().toLowerCase();
                render();
            });
            /*---------- 렌더링 -----------*/
            function getFiltered(){
                return memos.filter(memo => {
                const tagMatch =
                    !activeTag || memo.tag === activeTag;

                const textMatch =
                    !searchingTerm ||
                    memo.title.toLowerCase().includes(searchingTerm) ||
                    memo.lead.toLowerCase().includes(searchingTerm);
                    return tagMatch && textMatch;
                });
            }
            function render(){
                const filtered = getFiltered();
                const sorted = [...filtered].sort(
                    (a, b) => Number(b.favorite) - Number(a.favorite)
                );
                // 메모가 아예 없는 경우
                if(memos.length === 0)
                {
                    emptyGrid.style.display = 'flex';
                    searchEmpty.style.display = 'none';
                    memoGrid.style.display = 'none';
                    return;
                }

                // 메모는 있지만 검색/태그 결과가 없는 경우
                if(filtered.length === 0)
                {
                    emptyGrid.style.display = 'none';
                    searchEmpty.style.display = 'flex';
                    memoGrid.style.display = 'none';
                    return;
                }

                // 검색 결과가 있는 경우
                emptyGrid.style.display = 'none';
                memoGrid.style.display = 'flex';
                searchEmpty.style.display = 'none';
                
                memoGrid.innerHTML = sorted.map((memo, index) => {        
                    return `
                        <article class="memo-card ${memo.tag}" data-id="${memo.id}">
                            <div class="memo-card-header">
                                <h2 class="memo-title">
                                    ${memo.title}
                                </h2>
                                <button
                                    class="favorite-btn ${memo.favorite ? 'active' : ''}"
                                    type="button"
                                    data-id="${memo.id}"
                                >
                                    ${memo.favorite ? '★' : '★'}
                                </button>
                            </div>

                            <p class="memo-content ${memo.tag}">
                                ${memo.lead}
                            </p>
                            <div class="memo-card-footer">
                                <span class="memo-tag ${memo.tag}">${memo.tag}</span>
                                <p class="memo-date">${formatDate(memo.date)}</p>
                            </div>
                        </article>
                    `;
                }).join('');
            }
            
            memoGrid.addEventListener('click', (e) => {

                /* 별 클릭 */
                const favoriteBtn = e.target.closest('.favorite-btn');
                if (favoriteBtn) {
                    const id = Number(favoriteBtn.dataset.id);
                    const memo = memos.find(
                        memo => memo.id === id
                    );
                    if (!memo) return;
                    /* favorite 상태 변경 */
                    memo.favorite = !memo.favorite;
                    /* 저장 */
                    localStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify(memos)
                    );
                    /* 다시 렌더링 */
                    render();
                    return;
                }
                    /* 카드 클릭 */
                    const card = e.target.closest('.memo-card');
                    if (!card) return
                    const id = Number(card.dataset.id);
                    const selectedMemo = memos.find(
                        memo => memo.id === id
                    );
                    if (!selectedMemo) return;
                    selectedMemoId = id;
                    openModal(selectedMemo);
                });
                        
             /*---------- 모달 팝업 -----------*/ //모달 팝업에 내용을 넣어주는 함수
            function openModal(memo) {
                modalContents.classList.remove('Work', 'Daily', 'Others');
                modalContents.classList.add(memo.tag);
                
                modalTag.textContent = memo.tag;
                modalTitle.textContent = memo.title;
                modalContent.textContent = memo.lead;
                modalDate.textContent = formatDate(memo.date);
                modal.classList.add('show');
            }
            popupClose.addEventListener('click', () => {
            modal.classList.remove('show');
            });

            /*-----초기 실행-----*/
            buildTagMenu();
            render();

        })()