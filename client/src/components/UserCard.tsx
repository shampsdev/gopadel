import { User } from "@/types/user";
import { ChevronRight } from "lucide-react";

interface UserCardProps {
  user: User;
  onClick?: () => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-shrink-0 mr-4">
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={`${user.first_name} ${user.second_name}`} 
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white font-medium">
            {user.first_name.charAt(0)}
            {user.second_name.charAt(0)}
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="text-xl font-medium">{user.first_name} {user.second_name}</h3>
        <div className="flex flex-col text-gray-500 text-sm">
          <span>{user.city}</span>
          <span>Описание профиля</span>
        </div>
      </div>
      
      <ChevronRight className="text-gray-400" />
    </div>
  );
} 