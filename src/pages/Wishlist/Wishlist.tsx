import React, { useState, useEffect } from "react";
import ExamCard from "../Home/component/ExamCard";
import LeftSidebarUser from "../../components/LeftSideBarUser";

interface Exam {
  _id: string;
  title: string;
  image: string;
  questions: number;
  students: number;
  level: string;
  audio: string;
  views: number;
  solves: number;
}

interface ApiResponse {
  page: number;
  limit: number;
  total: number;
  items: Exam[];
}

export const Wishlist = () => {
  const [examData, setExamData] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'most_viewed' | 'most_solved'>('newest');

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      //const data: any = await getWishList();
      // console.log(data);
      // setExamData(data.data || []);
      // setTotalItems(data.data || 0);
      // setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [page, sortBy]);

  const totalPages = Math.ceil(totalItems / limit);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSortChange = (newSortBy: 'newest' | 'most_viewed' | 'most_solved') => {
    setSortBy(newSortBy);
    setPage(1); // Reset to first page when sorting changes
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-12">
        <div>Loading wishlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center mt-12">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (examData.length === 0) {
    return (
      <div className="flex justify-center items-center mt-12 flex-col">
        <div className="text-gray-500 text-lg mb-4">Your wishlist is empty</div>
        <div className="text-gray-400">Add some exams to your wishlist to see them here</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
			{/* Left Sidebar */}
			<LeftSidebarUser customHeight="h-auto w-64" />
			{/* Form Cài đặt */}
			<div>
      <section className="flex justify-center mt-12 flex-col items-center ml-2">
    
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 gap-y-12 mb-12 max-w-[1000px] justify-center items-center">
            {examData.map((item, index) => (
              <ExamCard
                key={item._id}
                id={item._id}
                title={item.title}
                image={item.image}
                questions={item.questions}
                students={item.students}
                level={item.level}
              />
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-8">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-2 border rounded-md ${
                  page === pageNum 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        )}

        {/* Page info */}
        {totalItems > 0 && (
          <div className="text-gray-600 text-sm mb-4">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems} items in wishlist
          </div>
        )}
      </section>
    </div>
		</div>
  );
};