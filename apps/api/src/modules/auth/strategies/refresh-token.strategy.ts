import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import type { Request } from "express"
import { ConfigService } from "@nestjs/config"
import { JwtPayload } from "./jwt.strategy"

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>("JWT_REFRESH_SECRET"),
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.headers.authorization
      ?.replace("Bearer", "")
      .trim()

    if (!refreshToken) {
      throw new UnauthorizedException()
    }

    return {
      ...payload,
      refreshToken,
    }
  }
}


