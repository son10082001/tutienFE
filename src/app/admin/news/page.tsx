'use client';

import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';

import {
  useAdminCreateNews,
  useAdminDeleteNews,
  useAdminNewsList,
  useAdminUpdateNews,
  useAdminUploadNewsImage,
} from '@/api/news/queries';
import type { AdminNewsUpsertInput, NewsPost } from '@/api/news/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { API_URL } from '@/utils/const';
import MDEditor from '@uiw/react-md-editor';
import { Edit2, Loader2, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

const EMPTY_FORM: AdminNewsUpsertInput = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  isFeatured: false,
  isPublished: true,
  publishedAt: null,
};

const adminNewsFormSchema = z.object({
  title: z.string().trim().min(3, 'Tiêu đề tối thiểu 3 ký tự').max(255, 'Tiêu đề tối đa 255 ký tự'),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug tối thiểu 3 ký tự')
    .max(255, 'Slug tối đa 255 ký tự')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  excerpt: z.string().trim().min(10, 'Mô tả ngắn tối thiểu 10 ký tự').max(512, 'Mô tả ngắn tối đa 512 ký tự'),
  content: z.string().trim().min(30, 'Nội dung tối thiểu 30 ký tự'),
  coverImage: z.string().trim().optional().nullable(),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  publishedAt: z.string().optional().nullable(),
});

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  return local.slice(0, 16);
}

function resolveImagePreviewUrl(imageUrl?: string | null): string {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const apiOrigin = API_URL.replace(/\/api\/?$/, '');
  return `${apiOrigin}${imageUrl}`;
}

export default function AdminNewsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NewsPost | null>(null);
  const [form, setForm] = useState<AdminNewsUpsertInput>(EMPTY_FORM);
  const [publishedAtLocal, setPublishedAtLocal] = useState('');
  const PAGE_SIZE = 10;

  const { data, refetch } = useAdminNewsList({ variables: { page, limit: PAGE_SIZE, search: search.trim() || undefined } });
  const createMutation = useAdminCreateNews();
  const updateMutation = useAdminUpdateNews();
  const deleteMutation = useAdminDeleteNews();
  const uploadImageMutation = useAdminUploadNewsImage();
  const rows = data?.items ?? [];

  const pending = createMutation.isPending || updateMutation.isPending;
  const dialogTitle = editing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới';

  const totalPages = useMemo(() => data?.totalPages ?? 1, [data?.totalPages]);

  const toPayload = (): AdminNewsUpsertInput => ({
    ...form,
    coverImage: form.coverImage?.trim() || null,
    publishedAt: publishedAtLocal ? new Date(publishedAtLocal).toISOString() : null,
  });

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setPublishedAtLocal('');
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (item: NewsPost) => {
    setEditing(item);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      coverImage: item.coverImage ?? '',
      isFeatured: item.isFeatured,
      isPublished: item.isPublished,
      publishedAt: item.publishedAt,
    });
    setPublishedAtLocal(toDateTimeLocalValue(item.publishedAt));
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validated = adminNewsFormSchema.safeParse(toPayload());
    if (!validated.success) {
      toast.error(validated.error.issues[0]?.message || 'Dữ liệu bài viết chưa hợp lệ');
      return;
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: validated.data });
        toast.success('Đã cập nhật bài viết');
      } else {
        await createMutation.mutateAsync(validated.data);
        toast.success('Đã tạo bài viết');
      }
      await refetch();
      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể lưu bài viết');
    }
  };

  const uploadCover = async (file?: File | null) => {
    if (!file) return;
    try {
      const res = await uploadImageMutation.mutateAsync(file);
      setForm((p) => ({ ...p, coverImage: res.imageUrl }));
      toast.success('Upload ảnh bìa thành công');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload ảnh thất bại');
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      await refetch();
      toast.success('Đã xóa bài viết');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xóa bài viết');
    }
  };

  return (
    <div className='space-y-6 p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-2xl text-white'>Tin tức</h1>
          <p className='mt-1 text-sm text-white/50'>Quản lý bài viết hiển thị ngoài trang chủ và trang tin tức</p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='relative w-64'>
            <Search size={16} className='absolute top-1/2 left-3 -translate-y-1/2 text-white/30' />
            <Input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder='Tìm theo tiêu đề, slug...'
              className='border-white/10 bg-white/5 pl-10 text-white'
            />
          </div>
          <Button onClick={openCreate} className='gap-2 bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85'>
            <Plus size={16} />
            Tạo bài viết
          </Button>
        </div>
      </div>

      <div className='overflow-hidden rounded-xl border border-white/10'>
        <Table>
          <TableHeader className='bg-white/5'>
            <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
              <TableHead className='text-white/50'>Tiêu đề</TableHead>
              <TableHead className='text-white/50'>Slug</TableHead>
              <TableHead className='text-white/50'>Trạng thái</TableHead>
              <TableHead className='text-white/50'>Nổi bật</TableHead>
              <TableHead className='text-right text-white/50'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
                <TableCell colSpan={5} className='py-12 text-center text-white/30'>
                  Chưa có bài viết nào
                </TableCell>
              </TableRow>
            )}
            {rows.map((item) => (
              <TableRow key={item.id} className='border-white/10 bg-transparent hover:bg-white/5'>
                <TableCell className='max-w-[320px] truncate text-white'>{item.title}</TableCell>
                <TableCell className='font-mono text-xs text-white/70'>{item.slug}</TableCell>
                <TableCell className={item.isPublished ? 'text-emerald-300' : 'text-yellow-300'}>
                  {item.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                </TableCell>
                <TableCell>{item.isFeatured ? <Star size={15} className='fill-[#44C8F3] text-[#44C8F3]' /> : '-'}</TableCell>
                <TableCell className='text-right'>
                  <div className='inline-flex items-center gap-1'>
                    <Button variant='ghost' size='icon' onClick={() => openEdit(item)} className='text-white/70 hover:bg-white/10 hover:text-white'>
                      <Edit2 size={15} />
                    </Button>
                    <Button variant='ghost' size='icon' onClick={() => remove(item.id)} className='text-red-400 hover:bg-red-500/10'>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between text-sm text-white/45'>
        <span>Tổng {data?.total ?? 0} bài viết</span>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Trước
          </Button>
          <span className='text-white/70'>
            {page} / {totalPages}
          </span>
          <Button variant='ghost' size='sm' onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            Sau
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto border-white/10 bg-[#0C111D] text-white sm:max-w-2xl'>
          <DialogHeader className='border-white/10 bg-[#0C111D]'>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='text-sm text-white/70'>Tiêu đề</label>
                <Input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className='border-white/10 bg-white/5 text-white placeholder:text-white/40' />
              </div>
              <div className='space-y-1.5'>
                <label className='text-sm text-white/70'>Slug</label>
                <Input required value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} className='border-white/10 bg-white/5 text-white placeholder:text-white/40' />
              </div>
            </div>
            <div className='space-y-1.5'>
              <label className='text-sm text-white/70'>Mô tả ngắn</label>
              <textarea
                required
                value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                className='min-h-[80px] w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/40'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-sm text-white/70'>Ảnh bìa (upload trực tiếp)</label>
              <Input
                type='file'
                accept='image/*'
                onChange={(e) => uploadCover(e.target.files?.[0] ?? null)}
                className='border-white/10 bg-white/5 text-white file:mr-3 file:rounded-md file:border-0 file:bg-[#44C8F3] file:px-3 file:py-1 file:font-medium file:text-black'
              />
              {uploadImageMutation.isPending && <p className='text-xs text-white/50'>Đang upload ảnh...</p>}
              {form.coverImage ? (
                <div className='overflow-hidden rounded-lg border border-white/10'>
                  <img src={resolveImagePreviewUrl(form.coverImage)} alt='cover-preview' className='h-32 w-full object-cover' />
                </div>
              ) : null}
            </div>
            <div className='space-y-1.5'>
              <label className='text-sm text-white/70'>Nội dung bài viết (Editor)</label>
              <div className='overflow-hidden rounded-md border border-white/10 bg-white/5'>
                <MDEditor
                  value={form.content}
                  onChange={(value) => setForm((p) => ({ ...p, content: value || '' }))}
                  height={300}
                  preview='edit'
                  data-color-mode='dark'
                />
              </div>
            </div>
            <div className='grid gap-4 sm:grid-cols-3'>
              <label className='flex items-center gap-2 text-sm text-white/80'>
                <input
                  type='checkbox'
                  checked={!!form.isPublished}
                  onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                />
                Xuất bản
              </label>
              <label className='flex items-center gap-2 text-sm text-white/80'>
                <input
                  type='checkbox'
                  checked={!!form.isFeatured}
                  onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                />
                Tin nổi bật
              </label>
              <div className='space-y-1.5'>
                <label className='text-sm text-white/70'>Thời gian đăng</label>
                <Input
                  type='datetime-local'
                  value={publishedAtLocal}
                  onChange={(e) => setPublishedAtLocal(e.target.value)}
                  className='border-white/10 bg-white/5 text-white [color-scheme:dark]'
                />
              </div>
            </div>
            <div className='flex justify-end gap-2'>
              <Button type='button' variant='ghost' onClick={() => setOpen(false)} className='text-white/70 hover:bg-white/10'>
                Hủy
              </Button>
              <Button type='submit' disabled={pending} className='bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85'>
                {pending ? <Loader2 size={16} className='mr-2 animate-spin' /> : null}
                Lưu bài viết
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
