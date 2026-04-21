'use client';

import { useMe } from '@/api/auth';
import { useBuyShopItem, useShopItems, useShopMeta } from '@/api/shop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, ShoppingCart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';

function formatVND(n: number) {
  return `${new Intl.NumberFormat('vi-VN').format(n)}đ`;
}

const ITEMS_PER_PAGE = 12;
const SEARCH_DEBOUNCE_MS = 350;

export default function MarketPlacePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const { data: me } = useMe({ enabled: isAuthenticated });
  const [serverId, setServerId] = useState<number | null>(null);
  const [buyingItemId, setBuyingItemId] = useState<string | null>(null);
  const [buyQuantity, setBuyQuantity] = useState('1');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortType, setSortType] = useState<'latest' | 'price-asc' | 'price-desc'>('price-desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: shopRes, isLoading } = useShopItems({
    variables: {
      page,
      limit: ITEMS_PER_PAGE,
      search: debouncedSearch || undefined,
      sort: sortType,
    },
  });
  const { data: meta } = useShopMeta({ enabled: isAuthenticated });

  const servers = meta?.servers ?? [];
  const characters = meta?.characters ?? [];
  const balance = meta?.balance ?? me?.balance ?? 0;
  const resolvedServerId = serverId ?? servers[0]?.id ?? null;
  const selectedCharacter =
    resolvedServerId != null ? (characters.find((c) => c.serverId === resolvedServerId) ?? null) : null;

  const items = shopRes?.items ?? [];
  const total = shopRes?.total ?? 0;
  const totalPages = shopRes?.totalPages ?? 1;

  const buyingItem = useMemo(() => items.find((item) => item.id === buyingItemId) ?? null, [items, buyingItemId]);

  const { mutate: buyItem, isPending } = useBuyShopItem({
    onSuccess: (res) => {
      notifySuccess('Mua thành công', `Số dư còn lại: ${formatVND(res.balanceAfter)}`);
      setBuyingItemId(null);
      setBuyQuantity('1');
      queryClient.refetchQueries({ queryKey: useShopMeta.getKey() });
      queryClient.refetchQueries({ queryKey: useShopItems.getKey() });
      queryClient.refetchQueries({ queryKey: useMe.getKey() });
    },
    onError: (e) => notifyErrorFromUnknown(e),
  });

  function getQty(): number {
    return Math.max(1, Number(buyQuantity) || 1);
  }

  function handleBuy(itemId: string, qty: number) {
    if (!isAuthenticated) {
      notifyErrorFromUnknown(new Error('Vui lòng đăng nhập để mua vật phẩm'));
      return;
    }
    if (!resolvedServerId) {
      notifyErrorFromUnknown(new Error('Vui lòng chọn server'));
      return;
    }
    if (!selectedCharacter) {
      notifyErrorFromUnknown(new Error('Server đã chọn chưa có nhân vật'));
      return;
    }
    buyItem({
      shopItemId: itemId,
      serverId: resolvedServerId,
      buyQuantity: qty,
    });
  }

  function resetFilters() {
    setSearch('');
    setDebouncedSearch('');
    setSortType('latest');
    setPage(1);
  }

  return (
    <div className='min-h-screen bg-black px-4 py-32'>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div className='text-center'>
          <h1 className='font-bold text-3xl text-white'>Cửa hàng</h1>
          <p className='mt-2 text-sm text-white/50'>Mua vật phẩm, hệ thống sẽ gửi mail vào game</p>
        </div>

        <div className='grid gap-5 lg:grid-cols-[300px_1fr]'>
          <aside className='space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4'>
            <div className='flex items-center justify-between border-b border-white/10 pb-3'>
              <p className='text-sm font-semibold text-white'>Bộ lọc</p>
              <button
                type='button'
                onClick={resetFilters}
                className='text-xs text-[#44C8F3] transition hover:text-[#44C8F3]/80'
              >
                Xóa lọc
              </button>
            </div>
            <div>
              <p className='text-sm text-white/45'>Server nhận</p>
              <select
                value={resolvedServerId ?? ''}
                onChange={(e) => setServerId(Number(e.target.value))}
                className='mt-1 h-9 w-full rounded border border-white/10 bg-white/5 px-2 text-white'
              >
                {servers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className='text-sm text-white/45'>Nhân vật</p>
              <p className='mt-1 truncate font-semibold text-[#44C8F3]'>
                {selectedCharacter?.name ?? 'Chưa có nhân vật'}
              </p>
            </div>
            <div>
              <p className='text-sm text-white/45'>Tìm tên vật phẩm</p>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Nhập tên để tìm...'
                className='mt-1 border-white/10 bg-white/5 text-white'
              />
            </div>
            <div>
              <p className='text-sm text-white/45'>Sắp xếp giá</p>
              <select
                value={sortType}
                onChange={(e) => {
                  setSortType(e.target.value as typeof sortType);
                  setPage(1);
                }}
                className='mt-1 h-9 w-full rounded border border-white/10 bg-white/5 px-2 text-white'
              >
                <option value='latest'>Mặc định</option>
                <option value='price-asc'>Giá thấp -&gt; cao</option>
                <option value='price-desc'>Giá cao -&gt; thấp</option>
              </select>
            </div>
          </aside>

          <section className='space-y-4'>
            {isLoading ? (
              <div className='flex items-center justify-center py-10'>
                <Loader2 className='animate-spin text-white/40' size={22} />
              </div>
            ) : (
              <>
                <div className='flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/50'>
                  <span>Tổng: {total} vật phẩm</span>
                  <span>
                    Trang {page}/{totalPages}
                  </span>
                </div>
                <div className='grid gap-3 grid-cols-2 xl:grid-cols-4'>
                  {items.map((item) => {
                    return (
                      <div key={item.id} className='rounded-xl border border-white/10 bg-white/5 p-3'>
                        {item.imageUrl ? (
                          <div className='mb-2 h-28 w-full rounded object-cover flex items-center justify-center'>
                            <img src={item.imageUrl} alt={item.itemName} className='h-28 w-28 object-cover' />
                          </div>
                        ) : (
                          <div className='mb-2 h-28 w-full rounded bg-white/10 object-cover' />
                        )}
                        <p className='line-clamp-1 text-sm font-semibold text-white'>{item.itemName}</p>
                        <p className='mt-1 text-xs text-white/45'>Tồn kho: {item.itemQuantity}</p>
                        <p className='mt-1 text-sm font-semibold text-[#44C8F3]'>{formatVND(item.price)}</p>

                        <div className='mt-2'>
                          <Button
                            onClick={() => {
                              if (!isAuthenticated) {
                                notifyErrorFromUnknown(new Error('Vui lòng đăng nhập để mua vật phẩm'));
                                return;
                              }
                              setBuyingItemId(item.id);
                              setBuyQuantity('1');
                            }}
                            disabled={isPending || !isAuthenticated || !selectedCharacter}
                            className='w-full bg-[#44C8F3] text-xs font-semibold text-black hover:bg-[#44C8F3]/85 disabled:opacity-50'
                          >
                            <ShoppingCart size={14} className='mr-1' /> Mua
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {items.length === 0 && (
                  <div className='rounded-xl border border-white/10 bg-white/5 py-10 text-center text-white/50'>
                    Không có vật phẩm phù hợp bộ lọc
                  </div>
                )}
                <div className='flex items-center justify-between border-t border-white/10 pt-3 text-sm text-white/45'>
                  <span>
                    Tổng {total} vật phẩm · {ITEMS_PER_PAGE} / trang
                  </span>
                  {totalPages > 1 ? (
                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className='flex h-8 w-8 items-center justify-center rounded-md border border-white/10 hover:bg-white/10 disabled:opacity-30'
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className='min-w-[4.5rem] text-center text-white/70'>
                        {page} / {totalPages}
                      </span>
                      <button
                        type='button'
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className='flex h-8 w-8 items-center justify-center rounded-md border border-white/10 hover:bg-white/10 disabled:opacity-30'
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className='text-white/35'>Trang 1 / 1</span>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      <Dialog
        open={!!buyingItem}
        onOpenChange={(open) => {
          if (!open) {
            setBuyingItemId(null);
            setBuyQuantity('1');
          }
        }}
      >
        <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Mua vật phẩm</DialogTitle>
          </DialogHeader>
          {buyingItem && (
            <div className='space-y-3'>
              <div>
                <p className='font-semibold text-white'>{buyingItem.itemName}</p>
                <p className='text-xs text-white/50'>Tồn kho: {buyingItem.itemQuantity}</p>
                <p className='mt-1 text-sm text-[#44C8F3]'>Giá: {formatVND(buyingItem.price)}</p>
              </div>
              <div className='space-y-1'>
                <label className='text-xs text-white/60'>Số lượng mua</label>
                <Input
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(e.target.value.replace(/\D/g, ''))}
                  className='border-white/10 bg-white/5 text-white'
                />
              </div>
              <p className='text-sm text-white/70'>
                Tổng tiền: <span className='font-semibold text-white'>{formatVND(buyingItem.price * getQty())}</span>
              </p>
              {buyingItem.price * getQty() > balance && <p className='text-xs text-red-400'>Không đủ số dư</p>}
              {getQty() > buyingItem.itemQuantity && <p className='text-xs text-red-400'>Vượt quá tồn kho</p>}
              {!isAuthenticated && <p className='text-xs text-yellow-400'>Vui lòng đăng nhập để mua vật phẩm</p>}
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setBuyingItemId(null);
                    setBuyQuantity('1');
                  }}
                  className='flex-1 border-white/15 bg-transparent text-white hover:bg-white/10'
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => handleBuy(buyingItem.id, getQty())}
                  disabled={
                    isPending ||
                    !isAuthenticated ||
                    !selectedCharacter ||
                    buyingItem.price * getQty() > balance ||
                    getQty() > buyingItem.itemQuantity
                  }
                  className='flex-1 bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85 disabled:opacity-50'
                >
                  {isPending ? (
                    <>
                      <Loader2 size={15} className='mr-2 animate-spin' /> Đang mua...
                    </>
                  ) : (
                    <>Xác nhận</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
