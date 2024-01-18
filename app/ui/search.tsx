'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback} from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {

  const searchParams = useSearchParams(); //클라이언트단에서 파라미터 입력값을 받아야 하기 때문에 useSearchParams를 씀.
  const pathname = usePathname();
  const { replace } = useRouter();

  /*
    use-debounce라는 라이브러리를 사용해
    매 키보드 타이핑마다 db호출을 방지하는 현상을 막는다.
    여기선 키보드 타이핑이 끝난 후 0.3초 동안 동작이 없으면 실행하도록 되어 있음.
    
  */
  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    params.set('page','1'); //이 부분이 추가가 되면 화면에서 input 입력 시 page=1 정보가 자동으로 포함이 된다. 현재는 1 강제로 설정.
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);


  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()} /* useSearchParams를 사용하지 않으므로 defaultValue 지정이 가능하다고 한다.*/
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
