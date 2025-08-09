import React from 'react';

const AdminScoreboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-tedx-black mb-4">
                            Admin Scoreboard
                        </h1>
                        <p className="text-xl text-gray-600">
                            Manage and view participant scores
                        </p>
                    </div>

                    {/* Placeholder for admin components */}
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <p className="text-gray-600">Admin functionalities will be implemented here.</p>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default AdminScoreboard;
