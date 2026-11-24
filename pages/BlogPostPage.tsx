import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { type Route } from '../types';
import { blogPageData } from '../constants';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import { usePageSEO } from '../utils/seoUtils';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

interface BlogPostPageProps {
    navigate: (route: Route, context?: any) => void;
    postId: number;
}

const BlogPostPage = ({ navigate, postId }: BlogPostPageProps) => {
    const post = useMemo(() => blogPageData.posts.find(p => p.id === postId) || blogPageData.posts[0], [postId]);

    // Dynamic SEO update for specific blog post
    usePageSEO({
        title: post.title,
        description: post.excerpt || `${post.title} - Read expert career and technology insights on FOGSLY.`,
        author: post.author,
        publishedTime: post.date,
        type: 'article',
    }, [post]);

    const handleShare = () => {
        alert("Article link copied to clipboard!");
    };

    return (
        <div className="bg-[--color-bg-primary] min-h-screen">
            {/* Header / Navigation */}
            <div className="top-20 left-0 right-0 z-30 bg-[--color-bg-primary]/80 backdrop-blur-md border-b border-[--color-border] hidden md:block">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Button variant="ghost" size="sm" onClick={() => navigate('blog')} className="text-[--color-text-secondary]">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Insights
                    </Button>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-widest">Share this article</span>
                        <div className="flex gap-2">
                            <button onClick={handleShare} className="p-2 rounded-full hover:bg-[--color-bg-secondary] text-[--color-text-secondary] transition-colors"><Share2 size={16} /></button>
                            <button onClick={handleShare} className="p-2 rounded-full hover:bg-[--color-bg-secondary] text-[--color-text-secondary] transition-colors"><Facebook size={16} /></button>
                            <button onClick={handleShare} className="p-2 rounded-full hover:bg-[--color-bg-secondary] text-[--color-text-secondary] transition-colors"><Twitter size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>

            <article className="pt-32 pb-24">
                {/* Article Header */}
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div {...fadeIn} className="text-center mb-12">
                        <Badge variant="secondary" className="bg-[--color-primary]/10 text-[--color-primary] mb-6 px-4 py-1">{post.category}</Badge>
                        <h1 className="text-4xl md:text-6xl font-bold text-[--color-text-primary] leading-tight mb-8">
                            {post.title}
                        </h1>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-[--color-text-secondary] font-medium border-y border-[--color-border] py-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[--color-bg-secondary] flex items-center justify-center text-[--color-primary] font-bold">
                                    {post.author.charAt(0)}
                                </div>
                                <span>{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-[--color-text-secondary]" />
                                <span>{post.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-[--color-text-secondary]" />
                                <span>8 min read</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Hero Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto px-4 max-w-6xl mb-16"
                >
                    <div className="aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl border border-[--color-border]">
                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                </motion.div>

                {/* Content */}
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="prose prose-lg prose-teal max-w-none">
                        <p className="text-xl md:text-2xl text-[--color-text-secondary] leading-relaxed font-medium mb-12 italic border-l-4 border-[--color-primary] pl-8">
                            {post.excerpt}
                        </p>

                        <div className="text-[--color-text-primary] leading-[1.8] space-y-8 text-lg">
                            <p>
                                The digital landscape is undergoing a profound transformation. As we navigate the complexities of modern work, the integration of advanced technologies like AI and blockchain is no longer a luxury but a necessity for sustainable growth. At Fogsly, we believe that the future of freelancing lies in creating an environment where trust is automated and opportunities are truly global.
                            </p>

                            <h2 className="text-3xl font-bold text-[--color-text-primary] mt-12 mb-6">Embracing the Shift</h2>
                            <p>
                                Traditional marketplaces often suffer from high transaction fees and fragmented communication. By productizing services and leveraging native utility tokens, we are eliminating these friction points. This allows professionals to focus on what they do best: delivering high-quality results for their clients.
                            </p>

                            <blockquote className="bg-[--color-bg-secondary] p-8 rounded-3xl border-l-8 border-[--color-primary] my-12">
                                <p className="text-2xl font-bold text-[--color-text-primary] leading-snug">
                                    "True innovation isn't about just doing things faster; it's about fundamentally changing the rules of the game to empower the individual."
                                </p>
                            </blockquote>

                            <p>
                                {post.content}
                            </p>

                            <p>
                                As we continue to build and refine the Fogsly ecosystem, our focus remains steadfast on our core mission: providing a secure, transparent, and rewarding platform for professionals worldwide. We invite you to join us on this journey as we redefine the digital economy together.
                            </p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-16 pt-8 border-t border-[--color-border]">
                            {post.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-[--color-text-secondary] border-[--color-border]">#{tag}</Badge>
                            ))}
                        </div>

                        {/* Author Section */}
                        <div className="mt-20 p-8 md:p-12 bg-[--color-bg-secondary] rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 border border-[--color-border]">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[--color-card] flex items-center justify-center text-3xl font-bold text-[--color-primary] shadow-sm border border-[--color-border] flex-shrink-0">
                                {post.author.charAt(0)}
                            </div>
                            <div className="text-center md:text-left">
                                <h4 className="text-2xl font-bold text-[--color-text-primary] mb-2">Written by {post.author}</h4>
                                <p className="text-[--color-text-secondary] leading-relaxed mb-6">
                                    {post.authorBio}
                                </p>
                                <div className="flex justify-center md:justify-start gap-4">
                                    <Button variant="outline" size="sm" className="rounded-full border-[--color-border] text-[--color-text-primary] hover:bg-[--color-bg-secondary]">Follow Author</Button>
                                    <Button variant="ghost" size="sm" className="rounded-full text-[--color-text-secondary]">View Profile</Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </article>

            {/* Related Content / Back to Blog CTA */}
            <section className="bg-[--color-bg-secondary] py-24 border-t border-[--color-border]">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-3xl font-bold mb-8 text-[--color-text-primary]">Keep Exploring</h3>
                    <Button size="lg" onClick={() => navigate('blog')} className="bg-[--color-primary] hover:bg-[--color-primary]/90 rounded-full px-10 shadow-lg shadow-[--color-primary]/20">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Insights
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default BlogPostPage;