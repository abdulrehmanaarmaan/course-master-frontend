import Logo from "./Logo";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-base-200 to-base-300 border-t border-primary/20 mt-12 sm:mt-16 w-full max-w-full overflow-x-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {/* Brand */}
                <div className="space-y-3">
                    <Logo />
                    <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed max-w-sm">
                        Digital learning for the next generation. Transform your career with expert-led courses.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="font-bold mb-3 sm:mb-4 text-base sm:text-lg text-primary">Quick Links</h4>
                    <ul className="space-y-2 text-xs sm:text-sm">
                        <li>
                            <a className="link link-hover text-base-content/80 hover:text-primary transition-colors" href="/">
                                Home
                            </a>
                        </li>
                        <li>
                            <a className="link link-hover text-base-content/80 hover:text-primary transition-colors" href="/courses">
                                Courses
                            </a>
                        </li>
                        <li>
                            <a className="link link-hover text-base-content/80 hover:text-primary transition-colors" href="/about">
                                About Us
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="font-bold mb-3 sm:mb-4 text-base sm:text-lg text-primary">Contact</h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-base-content/80">
                        <li className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold">Email:</span>
                            <a href="mailto:support@coursemaster.com" className="link link-hover text-primary break-all">
                                support@coursemaster.com
                            </a>
                        </li>
                        <li className="flex items-center gap-1.5">
                            <span className="font-semibold">Phone:</span>
                            <span>+880 1XXXXXXXXX</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="text-center text-xs sm:text-sm py-4 bg-base-300/50 text-base-content/70 border-t border-base-300 px-4">
                © {new Date().getFullYear()} CourseMaster. All rights reserved.
            </div>
        </footer>
    );
}