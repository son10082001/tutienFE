'use client';

import {
  useAdminSettings,
  useCreateGameServerSetting,
  useDeleteGameServerSetting,
  useUpdatePaymentMethodSetting,
  useUpdateRolePermissions,
} from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';
import { useEffect, useState } from 'react';

type RoleKey = 'OPERATOR' | 'ADVERTISER';

const VIETQR_BANK_OPTIONS = [
  { name: 'Vietcombank', code: 'VCB' },
  { name: 'BIDV', code: 'BIDV' },
  { name: 'VietinBank', code: 'CTG' },
  { name: 'Agribank', code: 'VBA' },
  { name: 'Techcombank', code: 'TCB' },
  { name: 'MB Bank', code: 'MB' },
  { name: 'ACB', code: 'ACB' },
  { name: 'VPBank', code: 'VPB' },
  { name: 'TPBank', code: 'TPB' },
  { name: 'Sacombank', code: 'STB' },
  { name: 'HDBank', code: 'HDB' },
  { name: 'VIB', code: 'VIB' },
  { name: 'SeABank', code: 'SEAB' },
  { name: 'SHB', code: 'SHB' },
  { name: 'OCB', code: 'OCB' },
  { name: 'MSB', code: 'MSB' },
  { name: 'Eximbank', code: 'EIB' },
  { name: 'Nam A Bank', code: 'NAB' },
  { name: 'PVcomBank', code: 'PVCB' },
  { name: 'Cake by VPBank', code: 'CAKE' },
] as const;

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminSettings();
  const { mutate: createGameServer } = useCreateGameServerSetting();
  const { mutate: deleteGameServer } = useDeleteGameServerSetting();
  const { mutate: updateRolePermissions } = useUpdateRolePermissions();
  const { mutate: updateMethod } = useUpdatePaymentMethodSetting();

  const [permissionDraft, setPermissionDraft] = useState<Record<RoleKey, string[]>>({
    OPERATOR: [],
    ADVERTISER: [],
  });
  const [methodDraft, setMethodDraft] = useState<
    Record<
      'vietqr' | 'momo',
      {
        accountName: string;
        phoneNumber: string;
        bankName: string;
        bankCode: string;
        bankNumber: string;
      }
    >
  >({
    vietqr: { accountName: '', phoneNumber: '', bankName: '', bankCode: '', bankNumber: '' },
    momo: { accountName: '', phoneNumber: '', bankName: '', bankCode: '', bankNumber: '' },
  });
  const [serverDraft, setServerDraft] = useState({
    code: '',
    name: '',
    host: '',
  });
  const [deletingServer, setDeletingServer] = useState<{ id: string; code: string; name: string } | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: useAdminSettings.getKey() });

  useEffect(() => {
    if (!data) return;
    setPermissionDraft({
      OPERATOR: data.rolePermissions.OPERATOR ?? [],
      ADVERTISER: data.rolePermissions.ADVERTISER ?? [],
    });
    const vqr = data.paymentMethods.find((m) => m.code === 'vietqr');
    const momo = data.paymentMethods.find((m) => m.code === 'momo');
    setMethodDraft({
      vietqr: {
        accountName: vqr?.accountName ?? '',
        phoneNumber: vqr?.phoneNumber ?? '',
        bankName: (vqr?.banks?.[0]?.name as string) ?? '',
        bankCode: (vqr?.banks?.[0]?.code as string) ?? '',
        bankNumber: (vqr?.banks?.[0]?.accountNumber as string) ?? vqr?.accountNumber ?? '',
      },
      momo: {
        accountName: momo?.accountName ?? '',
        phoneNumber: momo?.phoneNumber ?? '',
        bankName: '',
        bankCode: '',
        bankNumber: '',
      },
    });
  }, [data]);

  return (
    <div className='space-y-8 p-8 text-white'>
      <div>
        <h1 className='text-2xl font-bold'>Cài đặt hệ thống</h1>
        <p className='mt-1 text-sm text-white/60'>
          Trang này chỉ cấu hình permission role và tài khoản thanh toán cố định.
        </p>
      </div>

      {isLoading ? <p className='text-white/50'>Đang tải...</p> : null}

      <section className='space-y-3 rounded-xl border border-white/10 bg-white/5 p-5'>
        <h2 className='font-semibold'>Server game (quản trị)</h2>
        <div className='grid gap-2 sm:grid-cols-4'>
          <Input
            value={serverDraft.code}
            onChange={(e) => setServerDraft((p) => ({ ...p, code: e.target.value }))}
            placeholder='Mã server'
            className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
          />
          <Input
            value={serverDraft.name}
            onChange={(e) => setServerDraft((p) => ({ ...p, name: e.target.value }))}
            placeholder='Tên server'
            className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
          />
          <Input
            value={serverDraft.host}
            onChange={(e) => setServerDraft((p) => ({ ...p, host: e.target.value }))}
            placeholder='Host/IP'
            className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
          />
          <Button
            onClick={() =>
              createGameServer(serverDraft, {
                onSuccess: () => {
                  notifySuccess('Đã tạo', 'Đã thêm server game');
                  setServerDraft({ code: '', name: '', host: '' });
                  refresh();
                },
                onError: notifyErrorFromUnknown,
              })
            }
          >
            Thêm server
          </Button>
        </div>

        <div className='space-y-2'>
          {(data?.gameServers ?? []).map((s) => (
            <div
              key={s.id}
              className='flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3'
            >
              <p className='text-sm text-white'>
                [{s.code}] {s.name} {s.host ? `- ${s.host}` : ''} {s.desc ? `(${s.desc})` : ''}
              </p>
              <Button variant='destructive' onClick={() => setDeletingServer({ id: s.id, code: s.code, name: s.name })}>
                Xóa
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className='space-y-3 rounded-xl border border-white/10 bg-white/5 p-5'>
        <h2 className='font-semibold'>Permission theo role</h2>
        {(['OPERATOR', 'ADVERTISER'] as const).map((role) => (
          <div key={role} className='rounded-lg border border-white/10 bg-black/20 p-3'>
            <p className='mb-2 font-medium'>{role}</p>
            <div className='grid gap-2 sm:grid-cols-2'>
              {(data?.allPermissions ?? []).map((perm) => {
                const checked = permissionDraft[role].includes(perm);
                return (
                  <label key={perm} className='flex items-center gap-2 text-sm'>
                    <input
                      type='checkbox'
                      checked={checked}
                      onChange={(e) =>
                        setPermissionDraft((prev) => ({
                          ...prev,
                          [role]: e.target.checked ? [...prev[role], perm] : prev[role].filter((x) => x !== perm),
                        }))
                      }
                    />
                    <span>{perm}</span>
                  </label>
                );
              })}
            </div>
            <Button
              className='mt-3'
              onClick={() =>
                updateRolePermissions(
                  { role, permissions: permissionDraft[role] },
                  {
                    onSuccess: () => {
                      notifySuccess('Đã lưu', `Đã cập nhật quyền cho ${role}`);
                      refresh();
                    },
                    onError: notifyErrorFromUnknown,
                  }
                )
              }
            >
              Lưu quyền {role}
            </Button>
          </div>
        ))}
      </section>

      <section className='space-y-3 rounded-xl border border-white/10 bg-white/5 p-5'>
        <h2 className='font-semibold'>Thanh toán cố định: VietQR và MoMo</h2>
        {(['vietqr', 'momo'] as const).map((code) => (
          <div key={code} className='rounded-lg border border-white/10 bg-black/20 p-3'>
            <p className='mb-2 font-medium uppercase'>{code}</p>
            <div className='grid gap-2 sm:grid-cols-2'>
              {code === 'vietqr' ? (
                <Input
                  value={methodDraft[code].accountName}
                  onChange={(e) =>
                    setMethodDraft((p) => ({ ...p, [code]: { ...p[code], accountName: e.target.value } }))
                  }
                  placeholder='Tên CTK'
                  className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
                />
              ) : null}
              {code === 'vietqr' ? (
                <>
                  <select
                    value={methodDraft[code].bankName}
                    onChange={(e) => {
                      const selectedBank = VIETQR_BANK_OPTIONS.find((bank) => bank.name === e.target.value);
                      setMethodDraft((p) => ({
                        ...p,
                        [code]: {
                          ...p[code],
                          bankName: e.target.value,
                          bankCode: selectedBank?.code ?? '',
                        },
                      }));
                    }}
                    className='h-10 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white'
                  >
                    <option value='' disabled>
                      Chọn ngân hàng
                    </option>
                    {VIETQR_BANK_OPTIONS.map((bank) => (
                      <option key={bank.code} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={methodDraft[code].bankCode}
                    onChange={(e) =>
                      setMethodDraft((p) => ({ ...p, [code]: { ...p[code], bankCode: e.target.value } }))
                    }
                    placeholder='Mã code ngân hàng'
                    className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
                  />
                  <Input
                    value={methodDraft[code].bankNumber}
                    onChange={(e) =>
                      setMethodDraft((p) => ({ ...p, [code]: { ...p[code], bankNumber: e.target.value } }))
                    }
                    placeholder='Số ngân hàng'
                    className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
                  />
                </>
              ) : (
                <Input
                  value={methodDraft[code].phoneNumber}
                  onChange={(e) =>
                    setMethodDraft((p) => ({ ...p, [code]: { ...p[code], phoneNumber: e.target.value } }))
                  }
                  placeholder='Số điện thoại MoMo'
                  className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
                />
              )}
            </div>
            <Button
              className='mt-3'
              onClick={() =>
                updateMethod(
                  {
                    code,
                    data: {
                      accountName: methodDraft[code].accountName || null,
                      phoneNumber: code === 'momo' ? methodDraft[code].phoneNumber || null : null,
                      bankName: methodDraft[code].bankName || null,
                      bankCode: code === 'vietqr' ? methodDraft[code].bankCode || null : null,
                      bankNumber: code === 'vietqr' ? methodDraft[code].bankNumber || null : null,
                    },
                  },
                  {
                    onSuccess: () => {
                      notifySuccess('Đã lưu', `Đã cập nhật ${code}`);
                      refresh();
                    },
                    onError: notifyErrorFromUnknown,
                  }
                )
              }
            >
              Lưu {code}
            </Button>
          </div>
        ))}
      </section>

      <Dialog open={!!deletingServer} onOpenChange={(v) => !v && setDeletingServer(null)}>
        <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-white'>Xóa server game</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-white/65'>
            Bạn có chắc muốn xóa server{' '}
            <span className='font-semibold text-white'>
              [{deletingServer?.code}] {deletingServer?.name}
            </span>
            ? Thao tác này không thể hoàn tác.
          </p>
          <div className='mt-4 flex justify-end gap-3'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setDeletingServer(null)}
              className='text-white/70 hover:bg-white/10'
            >
              Huỷ
            </Button>
            <Button
              type='button'
              className='bg-red-500 font-semibold text-white hover:bg-red-600'
              onClick={() => {
                if (!deletingServer) return;
                deleteGameServer(deletingServer.id, {
                  onSuccess: () => {
                    notifySuccess('Đã xóa', 'Đã xóa server game');
                    setDeletingServer(null);
                    refresh();
                  },
                  onError: (err) => {
                    notifyErrorFromUnknown(err);
                    setDeletingServer(null);
                  },
                });
              }}
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
