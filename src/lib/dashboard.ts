import connectDB from '@/lib/db';
import Layout from '@/models/Layout';

export interface DashboardStats {
  totalLayouts: number;
  totalFileSizeMB: string;
  latestUploadDate: string | null;
  recentLayouts: RecentLayout[];
}

export interface RecentLayout {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  fileSize: number;
  featured: boolean;
  createdAt: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    await connectDB();

    const [totalLayouts, fileSizeAgg, recentDocs] = await Promise.all([
      Layout.countDocuments(),
      Layout.aggregate([
        { $group: { _id: null, totalSize: { $sum: '$fileSize' } } },
      ]),
      Layout.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select('title category imageUrl fileSize featured createdAt')
        .lean(),
    ]);

    const totalBytes: number = fileSizeAgg[0]?.totalSize ?? 0;
    const totalFileSizeMB =
      totalBytes > 0 ? (totalBytes / (1024 * 1024)).toFixed(2) : '0.00';

    const latestUploadDate =
      recentDocs.length > 0
        ? new Date(recentDocs[0].createdAt as Date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : null;

    const recentLayouts: RecentLayout[] = recentDocs.map((doc) => ({
      _id: String(doc._id),
      title: doc.title as string,
      category: doc.category as string,
      imageUrl: doc.imageUrl as string,
      fileSize: (doc.fileSize as number) ?? 0,
      featured: (doc.featured as boolean) ?? false,
      createdAt: new Date(doc.createdAt as Date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    }));

    return { totalLayouts, totalFileSizeMB, latestUploadDate, recentLayouts };
  } catch {
    // Fallback mock data if DB is unavailable
    return {
      totalLayouts: 8,
      totalFileSizeMB: '24.50',
      latestUploadDate: '02/06/2026',
      recentLayouts: [
        {
          _id: 'mk1',
          title: 'Ethereal Bridal Glow',
          category: 'MAKEUP CÔ DÂU',
          imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?auto=format&fit=crop&q=80&w=400',
          fileSize: 0,
          featured: true,
          createdAt: '02/06/2026',
        },
        {
          _id: 'mk2',
          title: 'Neon Editorial Vibe',
          category: 'MAKEUP CONCEPT',
          imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=400',
          fileSize: 0,
          featured: true,
          createdAt: '01/06/2026',
        },
        {
          _id: 'mk3',
          title: 'Midnight Glam Party',
          category: 'MAKEUP TIỆC',
          imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=400',
          fileSize: 0,
          featured: false,
          createdAt: '31/05/2026',
        },
      ],
    };
  }
}
