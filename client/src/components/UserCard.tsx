import { User } from "@/types/user";
import { ChevronRight, MapPin, User as UserIcon, Star } from "lucide-react";
import LoyaltyBadge from "@/components/LoyaltyBadge";
import { getRatingWord } from "@/utils/ratingUtils";

interface UserCardProps {
  user: User;
  onClick?: () => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 flex items-start cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex-shrink-0 mr-4 relative">
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={`${user.first_name} ${user.second_name}`} 
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold text-lg">
            {user.first_name.charAt(0)}
            {user.second_name.charAt(0)}
          </div>
        )}
        
        {/* Loyalty badge */}
        <div className="absolute -bottom-1 -right-1">
          <LoyaltyBadge 
            loyaltyId={user.loyalty_id} 
            size="sm"
          />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {user.first_name} {user.second_name}
        </h3>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin size={14} className="mr-1.5 text-gray-400" />
          <span>{user.city}</span>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <Star size={14} className="mr-1.5 text-gray-400" />
          <span>{getRatingWord(user.rank)}</span>
        </div>
        
        {user.bio && (
          <div className="text-gray-600 text-sm leading-relaxed overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            <UserIcon size={14} className="inline mr-1.5 text-gray-400" />
            {user.bio}
          </div>
        )}
      </div>
      
      <ChevronRight className="text-gray-300 flex-shrink-0 ml-2 mt-1" size={20} />
    </div>
  );
} 